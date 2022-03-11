import re
from collections import defaultdict
from itertools import chain

from .config import (CONTAINER_PLUGIN_FILES_PATH, CONTAINER_PLUGIN_SERVER_PATH,
                     COPY_PLUGIN_DOCKER_FILE, COPY_SERVER_DOCKER_FILE,
                     DEPLOY_IMAGE_PATH, DEPLOY_PATH, DEV_IMAGE_PATH,
                     KUBERNETES_TEMPLATES_PATH, PIPENV_COMMAND,
                     PLUGIN_SERVER_PATH, REQUIREMENTS_TXT_COMMAND)
from .docker_interface import DockerMixin
from .exceptions import BaseManageError, InvalidPluginTypeError
from .git_interface import resolve_source
from .schema import ConfigurePluginModel, PluginModel
from .utils import Yaml, get_config, python_version_from_path

name_pattern = "-_a-zA-Z0-9 "


def resolve_path(path):
    path = path.absolute()
    if not path.exists():
        raise BaseManageError("path does not exist", path)
    return path


def expand_name(name, args, origin):
    try:
        name = name.format(**args)  # TODO: handle if not expanded
    except KeyError as e:
        (key,) = e.args
        raise BaseManageError(
            f"Key '{key}' was not provided for the plugin name '{name}'. Specify '{key}' under 'environment' in the plugin options.",
            origin,
        )
    if not re.match(f"^[{name_pattern}]+$", name):
        raise BaseManageError(
            f"invalid name '{name}' only '{name_pattern}' allowed", origin
        )
    return name


PLUGIN_TYPES = {"metrics": "METRIC", "summarizers": "SUMMARIZER"}


def clean_name(name):
    return re.sub("(^-+)|(-+$)", "", re.sub("[^a-z0-9]", "-", name.lower()))


def quote(string):
    return string.replace('"', r"\"").replace("$", r"\$")


COMMAND_MAP = {
    "Pipfile.lock": PIPENV_COMMAND,
    "Pipfile": PIPENV_COMMAND,
    "requirements.txt": REQUIREMENTS_TXT_COMMAND,
}


def get_service_command(plugin_path, name):
    for filename, command in COMMAND_MAP.items():
        if (plugin_path / filename).exists():
            return command
    raise BaseManageError(
        f"none of [{', '.join(COMMAND_MAP)}] exists, provide at least one", name
    )


class Plugin(DockerMixin):
    def __init__(
        self,
        plugin_type,
        source,
        image_url,
        environment,
        docker_username,
    ):
        if plugin_type not in PLUGIN_TYPES.values():
            raise InvalidPluginTypeError(f"invalid type {plugin_type}")
        self.plugin_type = plugin_type
        self.plugin_path, self.owner = resolve_source(source)

        config_path = self.plugin_path / "config.yaml"
        config = PluginModel.load(config_path, **Yaml.load(config_path, json=True))
        self.metadata = config.metadata
        self.metadata.update(environment)
        self.environment = self.metadata.copy()
        self.environment["PLUGIN_TYPE"] = self.plugin_type

        self.name = expand_name(config.name, self.environment, source)

        self.devimage_path = (
            DEV_IMAGE_PATH / config.devimage
            if config.devimage
            else self.plugin_path / "Dockerfile.dev"
        )
        self.deployimage_path = (
            DEPLOY_IMAGE_PATH / config.deployimage
            if config.deployimage
            else self.plugin_path / "Dockerfile"
        )

        self.short_safe_name = clean_name(f"{self.owner}-{self.name}")

        self.safe_name = f"tldr-{self.plugin_type.lower()}-{self.short_safe_name}"
        self.url = f"http://{self.safe_name}:5000"
        self.url_env = (
            f"{self.short_safe_name.upper().replace('-', '_')}_{self.plugin_type}_URL",
            f"{self.url}",
        )
        self.docker_compose_url_env = ["=".join(self.url_env)]
        self.kubernetes_name = f"{self.plugin_type.lower()}-{self.short_safe_name}"
        self.deployment_name = f"tldr-{self.kubernetes_name}"

        self.dev_environment = [
            f"{key}={value}" for key, value in self.environment.items()
        ]

        self.build_environment = "\n".join(
            f"ENV {env}"
            for env in [
                f'{key}="{quote(value)}"' for key, value in self.environment.items()
            ]
        )
        self.named_volumes = {
            f"{self.safe_name}_root": "/root",
        }
        self.docker_compose_named_volumes = {key: None for key in self.named_volumes}
        self.path_volumes = {
            str(PLUGIN_SERVER_PATH): CONTAINER_PLUGIN_SERVER_PATH,
            str(self.plugin_path): CONTAINER_PLUGIN_FILES_PATH,
        }
        self.volumes = {**self.named_volumes, **self.path_volumes}
        self.path_volumes = {
            str(PLUGIN_SERVER_PATH): CONTAINER_PLUGIN_SERVER_PATH,
            str(self.plugin_path): CONTAINER_PLUGIN_FILES_PATH,
        }
        self.version = config.version
        self.command = f'bash -c "{get_service_command(self.plugin_path, self.name)}"'
        # TODO: rename
        DockerMixin.__init__(
            self,
            deploy_src=KUBERNETES_TEMPLATES_PATH / "plugin.yaml",
            deploy_dest=DEPLOY_PATH
            / f"{self.plugin_type.lower()}"
            / f"{self.name}.yaml",
            docker_username=docker_username,
            name=self.safe_name,
            image_url=image_url,
        )

    def get_version(self):
        return self.version

    def python_version_arg(self):
        return python_version_from_path(self.plugin_path)

    def build_chain_args(self):
        self.load_docker()
        dockerfile = resolve_path(self.deployimage_path).read_text()
        return [
            {
                "dockerfile": dockerfile,
                "context_path": self.plugin_path,
                "buildargs": self.python_version_arg(),
            },
            {
                "dockerfile": COPY_PLUGIN_DOCKER_FILE.format(
                    environment=self.build_environment()
                ),
                "context_path": self.plugin_path,
            },
            {
                "dockerfile": COPY_SERVER_DOCKER_FILE,
                "context_path": PLUGIN_SERVER_PATH,
            },
        ]

    def patch(self):
        labels = {"tier": self.kubernetes_name, "version": self.version}
        deployment = {
            "metadata": {"name": self.deployment_name, "labels": labels},
            "spec": {
                "selector": {"matchLabels": labels},
                "template": {
                    "metadata": {"labels": labels},
                    "spec": {
                        "containers": {
                            0: {"name": self.kubernetes_name, "image": self.image_url}
                        }
                    },
                },
            },
        }
        service = {
            "metadata": {"name": self.deployment_name},
            "spec": {"selector": labels},
        }
        return {0: deployment, 1: service}

    def to_service(self):
        devimage_path = resolve_path(self.devimage_path)
        python_version = self.python_version_arg()
        args = {"args": python_version} if python_version is not None else {}
        return {
            self.safe_name: {
                "image": f"{self.safe_name}:latest",
                "build": {
                    "context": str(devimage_path.parent),
                    "dockerfile": devimage_path.name,
                    **args,
                },
                "working_dir": CONTAINER_PLUGIN_FILES_PATH,
                "volumes": [":".join(item) for item in self.volumes.items()],
                "command": self.command,
                "environment": self.dev_environment,
            }
        }

    def plugin_config(self):
        return {**self.metadata, "name": self.name, "owner": self.owner}


class Plugins:
    def __init__(self, plugin_dict):
        self.plugin_dict = plugin_dict

    def to_list(self):
        return chain.from_iterable(self.plugin_dict.values())

    def to_dict(self):
        return self.plugin_dict.copy()

    def __iter__(self):
        return iter(self.to_list())

    def plugin_config(self):
        return {
            f"{plugin_type.upper()}": {
                plugin.short_safe_name: plugin.plugin_config() for plugin in plugins
            }
            for plugin_type, plugins in self.plugin_dict.items()
        }

    def api_kubernetes_env(self):
        envs = []
        for plugins in self.plugin_dict.values():
            for plugin in plugins:
                name, value = plugin.url_env
                envs.append({"name": name, "value": value})
        return envs

    def gen_kubernetes(self):
        for plugins in self.plugin_dict.values():
            for plugin in plugins:
                plugin.gen_kubernetes()

    @classmethod
    def load(cls):
        config = get_config()
        plugins = defaultdict(list)
        for plugin_type in PLUGIN_TYPES:
            init_args_list = getattr(config, plugin_type)
            for init_args in init_args_list:
                if not isinstance(init_args, ConfigurePluginModel):
                    init_args = ConfigurePluginModel(source=init_args)
                init_args = init_args.dict()
                plugins[plugin_type].append(
                    Plugin(
                        plugin_type=PLUGIN_TYPES[plugin_type],
                        **init_args,
                        docker_username=config.docker_username,
                    )
                )
        return cls(dict(plugins))
