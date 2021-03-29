import io
import json
import tarfile
from abc import ABC, abstractmethod, abstractstaticmethod
from pathlib import Path

import docker
import git
import giturlparse
import marshmallow
from ruamel.yaml.comments import CommentedMap
from termcolor import colored

from .config import KUBERNETES_PATH
from .schema import (GlobalConfigSchema, GlobalMetricConfigSchema,
                     GlobalSummarizerConfigSchema, MetricPluginSchema,
                     SummarizerPluginSchema)
from .utils import (abort, check_attr, dump_yaml, gen_hash, get_config,
                    load_dockerfile_base, load_yaml)


class Plugin(ABC):
    __type__ = None

    WORKING_DIR = "/app"
    BASE_COMMAND = " && ".join(
        [
            "pip install flask",
            "python model_setup.py",
            "cd /server",
            "python wsgi.py",
        ]
    )

    def __init__(self, init_data, docker_username=None):
        if isinstance(init_data, str):
            init_data = {"source": init_data}

        try:
            global_config = self.global_config_schema().load(init_data)
        except marshmallow.ValidationError as error:
            abort(error)

        source = global_config["source"]
        if giturlparse.validate(source):
            p = giturlparse.parse(source)
            plugin_name = f"{p.platform}---{p.owner}---{p.repo}---{p.branch}"
            plugin_path = Path("~/.tldr_plugins").expanduser() / plugin_name
            if not plugin_path.exists():
                print(
                    f"cloning {colored(source, 'green')} to {colored(plugin_path, 'green')}"
                )
                plugin_path.parent.mkdir(exist_ok=True, parents=True)
                git.Repo.clone_from(source, plugin_path)
            self.plugin_path = plugin_path
        else:
            self.plugin_path = Path(source).absolute()

        try:
            config_json = load_yaml(self.plugin_path / "config.yaml")
        except FileNotFoundError:
            abort("plugin config is not present", source)

        try:
            config = self.plugin_schema().load(config_json)
        except marshmallow.ValidationError as error:
            abort(error)
        config.update(global_config.get("config", {}))
        config["global_env"] = global_config.get("environment", {})
        self.config = config

        self.docker_username = docker_username

        check_attr(self, "name", "no name is set for the plugin", source)
        check_attr(self, "version", "no version is set for the plugin", self.name)
        check_attr(
            self, "readable", "no readable name is set for the plugin", self.name
        )
        check_attr(self, "type", "no type is set for the plugin", self.name)
        check_attr(
            self,
            "devimage_path",
            "no Dockerfile.dev or devimage was provided",
            self.name,
        )

    @property
    def devimage_path(self):
        devimage = self.config.get("devimage")
        if devimage:
            path = Path("./images/dev") / devimage
        else:
            path = self.plugin_path / "Dockerfile.dev"
        return path.absolute() if path.exists() else None

    @property
    def command(self):
        pipfile = self.plugin_path / "Pipfile"
        pipfilelock = self.plugin_path / "Pipfile.lock"
        requirements_file = self.plugin_path / "requirements.txt"

        if pipfile.exists() or pipfilelock.exists():
            command = f"pipenv install && pipenv run bash -c '{self.BASE_COMMAND}'"
        elif requirements_file.exists():
            command = f"pip install -r requirements.txt && {self.BASE_COMMAND}"
        else:
            abort("neither requirements.txt nor Pipfile exists", self.name)
        return f'bash -c "{command}"'

    @abstractmethod
    def global_config_schema(self):
        pass

    @abstractmethod
    def plugin_schema(self):
        pass

    @property
    def type(self):
        return self.config.get("type")

    @property
    def version(self):
        return self.config.get("version")

    @property
    def homepage(self):
        return self.config.get("homepage")

    @property
    def sourcecode(self):
        return self.config.get("sourcecode")

    @property
    def model(self):
        return self.config.get("model")

    @property
    def readable(self):
        return self.config.get("readable")

    @property
    def deployimage(self):
        return self.config.get("deployimage")

    @property
    def dockerfile(self):
        deployimage = self.deployimage
        if deployimage:
            with open(Path("./images/deploy") / deployimage) as file:
                return file.read()
        with open(self.plugin_path / "Dockerfile") as file:
            return file.read()

    def dockerfile_copy_plugin(self, previous_id):
        dockerfile_parts = []
        dockerfile_parts.append(f"FROM {previous_id}")
        dockerfile_parts.extend([f"ENV {env}" for env in self.environment_list])
        dockerfile_parts.append("WORKDIR /app")
        dockerfile_parts.append("COPY . .")
        dockerfile_parts.append("RUN python model_setup.py")
        return "\n".join(dockerfile_parts)

    def dockerfile_copy_server(self, previous_id):
        dockerfile_parts = []
        dockerfile_parts.append(f"FROM {previous_id}")
        dockerfile_parts.append("WORKDIR /server")
        dockerfile_parts.append("COPY . .")
        dockerfile_parts.append(load_dockerfile_base())
        return "\n".join(dockerfile_parts)

    @property
    def host_volumes(self):
        return {
            str(Path("./plugin_server").absolute()): "/server",
            str(self.plugin_path): "/app",
        }

    #     @property
    #     def host_volumes(self):
    #         return {
    #             str(Path("./plugin_server").absolute()): "/server",
    #             str(self.plugin_path): "/server/plugin",
    #         }

    @property
    def named_volumes(self):
        return {f"{self.mangled_name}_root": "/root"}

    @property
    def volumes(self):
        volumes = self.named_volumes
        volumes.update(self.host_volumes)
        return volumes

    @property
    def name(self):
        return self.config.get("name")

    @property
    def mangled_name(self):
        return f"{self.__type__.lower()}_{self.name}"

    @property
    def url(self):
        return f"http://{self.mangled_name}:5000"

    @property
    def environment(self):
        config = self.config
        environment = {"PLUGIN_NAME": self.name, "PLUGIN_TYPE": self.__type__}
        environment.update(config.get("environment", {}))
        model = config.get("model")
        if model:
            environment["PLUGIN_MODEL"] = model
        return list(map(tuple, environment.items()))

    @property
    def environment_list(self):
        return list(map("=".join, self.environment))

    @property
    def repository(self):
        return f"{self.docker_username}/{self.mangled_name}"

    @property
    def tag(self):
        return f"{self.repository}:{self.version}"

    @property
    def url_env(self):
        return (f"{self.name.upper()}_{self.__type__}_URL", f"{self.url}")

    def named_volumes_to_config(self):
        return {volume: None for volume in self.named_volumes.keys()}

    @staticmethod
    def get_context(dockerfile, path):
        fh = io.BytesIO()
        with tarfile.open(fileobj=fh, mode="w:gz") as tar:
            data = dockerfile.encode("utf-8")
            tar.add(path, arcname=".")
            info = tarfile.TarInfo("Dockerfile")
            info.size = len(data)
            tar.addfile(info, io.BytesIO(data))
        fh.seek(0)
        return fh

    def _build(self, dockerfile, path):
        client = docker.from_env()
        context = self.get_context(dockerfile, path)
        print(colored("--- DOCKERFILE BEGIN ---", "yellow"))
        print(dockerfile)
        print(colored("--- DOCKERFILE END   ---", "yellow"))
        for status in client.api.build(
            fileobj=context, encoding="gzip", custom_context=True, decode=True
        ):
            error = status.get("error")
            if error:
                abort(error, self.name)
            stream = status.get("stream")
            if stream:
                print(stream, end="")
        context.seek(0)
        image = client.images.build(
            fileobj=context, encoding="gzip", custom_context=True
        )[0]
        return image.id.split(":")[1]

    def build_plugin_image(self):
        return self._build(self.dockerfile, self.plugin_path)

    def build_copy_plugin(self, previous_id):
        return self._build(self.dockerfile_copy_plugin(previous_id), self.plugin_path)

    def build_copy_server(self, previous_id):
        return self._build(
            self.dockerfile_copy_server(previous_id), Path("./plugin_server").absolute()
        )

    def build(self):
        if not self.docker_username:
            abort(
                "docker_username needs to be defined for tagging the image", self.name
            )
        colored_tag = colored(self.tag, "green")
        print(f"building " + colored_tag)
        previous_id = self.build_plugin_image()
        previous_id = self.build_copy_plugin(previous_id)
        final_id = self.build_copy_server(previous_id)
        client = docker.from_env()
        image = client.images.get(final_id)
        image.tag(self.tag)
        print(f"done building " + colored_tag)

    def push(self):
        if not self.docker_username:
            abort(
                "docker_username needs to be defined for identifying the docker account",
                self.name,
            )
        colored_tag = colored(self.tag, "green")
        print(f"pushing " + colored_tag)
        for line in docker.from_env().images.push(
            repository=self.repository, tag=self.version, stream=True
        ):
            if b"error" in line:
                status = json.loads(line)
                error = status.get("error")
                if error:
                    abort(
                        [
                            [self.name, error],
                            ["push", "failed (maybe you need to login first)"],
                        ]
                    )
        print(f"done pushing " + colored_tag)

    @property
    def image_url(self):
        return f"docker.io/{self.tag}"

    @property
    def port_name(self):
        name = self.name
        port_name = name
        if len(port_name) > 16:
            port_name = name[:11] + gen_hash(name)[:5]
        return port_name

    def gen_kubernetes(self):
        name = self.name
        deployment_name = f"summarizer-{name}"
        port_name = self.port_name
        env = list(dict(zip(("name", "value"), env)) for env in self.environment)
        image_url = self.image_url
        deployment, service = load_yaml(
            "./templates/kubernetes/plugin.yaml", multiple=True
        )
        metadata = deployment["metadata"]
        metadata["name"] = deployment_name
        metadata["labels"]["tier"] = name
        spec = deployment["spec"]
        spec["selector"]["matchLabels"]["tier"] = name
        template = spec["template"]
        template["metadata"]["labels"]["tier"] = name
        container = template["spec"]["containers"][0]
        container["name"] = name
        container["image"] = image_url
        container["env"] = env
        container["ports"][0]["name"] = port_name
        container["readinessProbe"]["httpGet"]["port"] = port_name

        service["metadata"]["name"] = deployment_name
        spec = service["spec"]
        spec["selector"]["tier"] = name
        spec["ports"][0]["targetPort"] = port_name
        path = Path(KUBERNETES_PATH / f"{self.__type__.lower()}/{name}.yaml")
        path.parent.mkdir(parents=True, exist_ok=True)
        dump_yaml([deployment, service], path, multiple=True)

    def to_yaml(self):
        config = self.config
        service_conf = CommentedMap()
        service_conf["image"] = f"{self.mangled_name}:latest"
        service_conf["build"] = {
            "context": str(self.devimage_path.parent),
            "dockerfile": str(self.devimage_path.name),
        }
        service_conf["working_dir"] = self.WORKING_DIR
        service_conf["volumes"] = list(map(":".join, self.volumes.items()))
        service_conf["command"] = self.command
        service_conf["environment"] = self.environment_list
        yaml_data = CommentedMap()
        yaml_data[self.mangled_name] = service_conf
        return yaml_data

    def plugin_config(self):
        return {
            "homepage": self.homepage,
            "sourcecode": self.sourcecode,
            "version": self.version,
            "readable": self.readable,
            "model": self.model,
            "type": self.type,
        }


class MetricPlugin(Plugin):
    __type__ = "METRIC"

    def global_config_schema(self):
        return GlobalMetricConfigSchema()

    def plugin_schema(self):
        return MetricPluginSchema()


class SummarizerPlugin(Plugin):
    __type__ = "SUMMARIZER"

    def global_config_schema(self):
        return GlobalSummarizerConfigSchema()

    def plugin_schema(self):
        return SummarizerPluginSchema()


class Plugins(ABC):
    __el_class__ = None
    __type__ = None

    def __init__(self, plugins=[]):
        self.plugins = {}
        for plugin in plugins:
            self.add(plugin)

    def __iter__(self):
        return iter(self.plugins.values())

    @classmethod
    def load(cls):
        config = get_config()
        docker_username = config.get("docker_username")
        init_data_list = config.get(cls.__type__.lower()) or []
        base_class = cls.__el_class__
        plugins = cls(
            base_class(init_data, docker_username=docker_username)
            for init_data in init_data_list
        )
        return plugins

    def add(self, plugin):
        plugins = self.plugins
        if not isinstance(plugin, self.__el_class__):
            abort(
                f"plugin needs to be of type {self.__el_class__.__name__}", plugin.name
            )
        if plugin.name in plugins:
            abort(
                f"there is more than one {self.__el_class__.__type__.lower()} plugin with this name",
                plugin.name,
            )
        plugins[plugin.name] = plugin

    def get(self, name):
        return self.plugins.get(name)

    def plugin_config(self):
        return {
            self.__type__: {
                plugin.name: plugin.plugin_config()
                for plugin in self.plugins.values()
            }
        }

    @property
    def api_kubernetes_env(self):
        envs = [plugin.url_env for plugin in self]
        return list(dict(zip(("name", "value"), env)) for env in envs)

    def gen_kubernetes(self):
        for plugin in self:
            plugin.gen_kubernetes()


class MetricPlugins(Plugins):
    __el_class__ = MetricPlugin
    __type__ = "METRICS"


class SummarizerPlugins(Plugins):
    __el_class__ = SummarizerPlugin
    __type__ = "SUMMARIZERS"
