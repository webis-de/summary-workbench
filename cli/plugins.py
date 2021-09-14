import configparser
import io
import json
import re
import tarfile
from abc import ABC, abstractmethod
from json import JSONDecodeError
from pathlib import Path

import docker
import git
import giturlparse
import marshmallow
from ruamel.yaml.comments import CommentedMap
from termcolor import colored

from .config import (
    KUBERNETES_PATH,
    BASE_COMMAND,
    PLUGIN_FOLDER,
    DEV_IMAGE_PATH,
    DEPLOY_IMAGE_PATH,
    CONTAINER_PLUGIN_FILES_PATH,
    CONTAINER_PLUGIN_SERVER_PATH,
    PLUGIN_SERVER_PATH,
)
from .schema import GlobalConfigSchema, PluginSchema
from .utils import (
    abort,
    check_attr,
    dump_yaml,
    gen_hash,
    get_config,
    load_dockerfile_base,
    load_yaml,
)


def docker_context(dockerfile, path):
    fh = io.BytesIO()
    with tarfile.open(fileobj=fh, mode="w:gz") as tar:
        data = dockerfile.encode("utf-8")
        tar.add(path, arcname=".")
        info = tarfile.TarInfo("Dockerfile")
        info.size = len(data)
        tar.addfile(info, io.BytesIO(data))
    fh.seek(0)
    return fh


def build_image(dockerfile, path, buildargs=None):
    client = docker.from_env()
    context = docker_context(dockerfile, path)
    print(colored("--- DOCKERFILE BEGIN ---", "yellow"))
    print(dockerfile)
    print(colored("--- DOCKERFILE END   ---", "yellow"))
    for status in client.api.build(
        fileobj=context,
        encoding="gzip",
        custom_context=True,
        decode=True,
        buildargs=buildargs,
    ):
        error = status.get("error")
        if error:
            abort(error, path)
        stream = status.get("stream")
        if stream:
            print(stream, end="")
    context.seek(0)
    image = client.images.build(fileobj=context, encoding="gzip", custom_context=True)[
        0
    ]
    return image.id.split(":")[1]


def is_github_link(source):
    return giturlparse.validate(source)


def from_github(source):
    p = giturlparse.parse(source)
    plugin_name = f"{p.platform}---{p.owner}---{p.repo}---{p.branch}"
    plugin_path = PLUGIN_FOLDER / plugin_name
    if not plugin_path.exists():
        print(f"cloning {colored(source, 'green')} to {colored(plugin_path, 'green')}")
        plugin_path.parent.mkdir(exist_ok=True, parents=True)
        git.Repo.clone_from(source, plugin_path)
    return plugin_path, p.owner


def load_config(path, source):
    try:
        return load_yaml(path / "config.yaml")
    except FileNotFoundError:
        abort("plugin config is not present", source)

expand_re = re.compile("{.*?}")
name_pattern = " -_a-zA-Z0-9"
parse_re = re.compile(f"^[{name_pattern}]+$")
def expand_name(name, args):
    templates = expand_re.findall(name)
    for template in templates:
        key = template[1:-1].strip()
        if key not in args:
            abort([f"{key} not found", name])
        name = name.replace(template, args[key])
    if not parse_re.match(name):
        abort(f"only {name_pattern} allowed", name)
    return name

PLUGIN_TYPES = ["METRIC", "SUMMARIZER"]

safe_re = re.compile("[^a-z0-9]")
sep_re = re.compile("(^-+)|(-+$)")
def clean_name(name):
    return sep_re.sub("", safe_re.sub("-", name.lower()))

def quote(string):
    return string.replace('"', r'\"').replace("$", r"\$")

class Plugin(ABC):
    def __init__(self, init_data, plugin_type, docker_username=None):
        if plugin_type not in PLUGIN_TYPES:
            abort(f"invalid type {plugin_type}")
        self.__type__ = plugin_type
        if isinstance(init_data, str):
            init_data = {"source": init_data}

        global_config = GlobalConfigSchema().load(init_data)
        source = global_config["source"]
        if is_github_link(source):
            self.plugin_path, self.owner = from_github(source)
        else:
            self.plugin_path = Path(source).absolute()
            self.owner = "anonymous"
        config_json = load_config(self.plugin_path, source)
        config = PluginSchema().load(config_json)
        config.update(global_config)
        self.config = config
        self.environment = config["metadata"].copy()
        self.environment.update(config["environment"])
        self.version = config["version"]
        self.name = expand_name(config["name"], self.environment)
        self.short_safe_name = clean_name(f"{self.owner}-{self.name}")
        self.safe_name = f"tldr-{self.__type__.lower()}-{self.short_safe_name}"
        self.url = f"http://{self.safe_name}:5000"
        self.url_env = f"{self.short_safe_name.upper().replace('-', '_')}_{self.__type__}_URL", f"{self.url}"
        self.named_volumes = {f"{self.safe_name}_root": "/root"}
        self.environment["PLUGIN_TYPE"] = self.__type__
        self.docker_username = docker_username

    @property
    def devimage_path(self):
        devimage = self.config.get("devimage")
        path = (
            DEV_IMAGE_PATH / devimage
            if devimage
            else self.plugin_path / "Dockerfile.dev"
        ).absolute()
        if not path.exists():
            abort("path does not exist", path)
        return path

    def command(self):
        pipfile = self.plugin_path / "Pipfile"
        pipfilelock = self.plugin_path / "Pipfile.lock"
        requirements_file = self.plugin_path / "requirements.txt"

        if pipfile.exists() or pipfilelock.exists():
            command = f"pipenv install && pipenv run bash -c '{BASE_COMMAND}'"
        elif requirements_file.exists():
            command = f"pip install -r requirements.txt && {BASE_COMMAND}"
        else:
            abort("neither requirements.txt nor Pipfile exists", self.name)
        return f'bash -c "{command}"'

    @property
    def dockerfile(self):
        deployimage = self.config.get("deployimage")
        path = (
            DEPLOY_IMAGE_PATH / deployimage
            if deployimage
            else self.plugin_path / "Dockerfile.dev"
        ).absolute()
        if not path.exists():
            abort("path does not exist", path)
        print(path)
        with open(path) as file:
            return file.read()

    def dockerfile_copy_plugin(self, previous_id):
        dockerfile_parts = []
        dockerfile_parts.append(f"FROM {previous_id}")
        dockerfile_parts.extend([f"ENV {env}" for env in self.build_environment()])
        dockerfile_parts.append(f"WORKDIR {CONTAINER_PLUGIN_SERVER_PATH}")
        dockerfile_parts.append("COPY . .")
        dockerfile_parts.append("RUN python model_setup.py")
        return "\n".join(dockerfile_parts)

    def dockerfile_copy_server(self, previous_id):
        dockerfile_parts = []
        dockerfile_parts.append(f"FROM {previous_id}")
        dockerfile_parts.append(f"WORKDIR {CONTAINER_PLUGIN_SERVER_PATH}")
        dockerfile_parts.append("COPY . .")
        dockerfile_parts.append(load_dockerfile_base())
        return "\n".join(dockerfile_parts)

    def host_volumes(self):
        return {
            str(PLUGIN_SERVER_PATH): CONTAINER_PLUGIN_SERVER_PATH,
            str(self.plugin_path): CONTAINER_PLUGIN_FILES_PATH,
        }


    def volumes(self):
        volumes = self.named_volumes
        volumes.update(self.host_volumes())
        return volumes

    def build_environment(self):
        return [f'{key}="{quote(value)}"' for key, value in self.environment.items()]

    def dev_environment(self):
        return [f"{key}={value}" for key, value in self.environment.items()]

    def repository(self):
        return f"{self.docker_username}/{self.safe_name}"

    def tag(self):
        return f"{self.repository()}:{self.version}"

    def python_version(self):
        pipfile = self.plugin_path / "Pipfile"
        pipfilelock = self.plugin_path / "Pipfile.lock"
        try:
            if pipfilelock.exists():
                with open(pipfilelock) as file:
                    return json.load(file)["_meta"]["requires"]["python_version"]
            if pipfile.exists():
                config_parser = configparser.ConfigParser()
                config_parser.read(pipfile)
                return config_parser["requires"]["python_version"].strip('"').strip("'")
        except (JSONDecodeError, KeyError):
            pass
        return None

    def named_volumes_to_config(self):
        return {volume: None for volume in self.named_volumes.keys()}

    def build_plugin_image(self):
        python_version = self.python_version()
        buildargs = {"image_version": python_version} if python_version else None
        return build_image(self.dockerfile, self.plugin_path, buildargs=buildargs)

    def build(self):
        if not self.docker_username:
            abort(
                "docker_username needs to be defined for tagging the image", self.name
            )
        colored_tag = colored(self.tag(), "green")
        print(f"building " + colored_tag)
        previous_id = self.build_plugin_image()
        previous_id = build_image(
            self.dockerfile_copy_plugin(previous_id), self.plugin_path
        )
        final_id = build_image(
            self.dockerfile_copy_server(previous_id), PLUGIN_SERVER_PATH
        )
        client = docker.from_env()
        image = client.images.get(final_id)
        image.tag(self.tag())
        print(f"done building " + colored_tag)

    def push(self):
        if not self.docker_username:
            abort(
                "docker_username needs to be defined for identifying the docker account",
                self.name,
            )
        colored_tag = colored(self.tag(), "green")
        print(f"pushing " + colored_tag)
        for line in docker.from_env().images.push(
            repository=self.repository(), tag=self.version, stream=True
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

    def image_url(self):
        return self.config.get("image_url") or f"docker.io/{self.tag()}"

    @property
    def kubernetes_name(self):
        return f"{self.__type__.lower()}-{self.short_safe_name}"

    def gen_kubernetes(self):
        name = self.kubernetes_name
        version = self.version
        deployment_name = f"tldr-{name}"
        deployment, service = load_yaml(
            "./templates/kubernetes/plugin.yaml", multiple=True
        )
        metadata = deployment["metadata"]
        metadata["name"] = deployment_name
        labels = metadata["labels"]
        labels["tier"] = name
        labels["version"] = version
        spec = deployment["spec"]
        labels = spec["selector"]["matchLabels"]
        labels["tier"] = name
        labels["version"] = version
        template = spec["template"]
        labels = template["metadata"]["labels"]
        labels["tier"] = name
        labels["version"] = version
        container = template["spec"]["containers"][0]
        container["name"] = name
        container["image"] = self.image_url()

        service["metadata"]["name"] = deployment_name
        spec = service["spec"]
        selector = spec["selector"]
        selector["tier"] = name
        selector["version"] = version
        path = Path(KUBERNETES_PATH / f"{self.__type__.lower()}/{self.name}.yaml")
        path.parent.mkdir(parents=True, exist_ok=True)
        dump_yaml([deployment, service], path, multiple=True)

    def to_yaml(self):
        service_conf = CommentedMap()
        service_conf["image"] = f"{self.safe_name}:latest"
        build_dict = {
            "context": str(self.devimage_path.parent),
            "dockerfile": str(self.devimage_path.name),
        }
        python_version = self.python_version()
        if python_version:
            build_dict["args"] = {"image_version": python_version}
        service_conf["build"] = build_dict
        service_conf["working_dir"] = CONTAINER_PLUGIN_FILES_PATH
        service_conf["volumes"] = list(map(":".join, self.volumes().items()))
        service_conf["command"] = self.command()
        service_conf["environment"] = self.dev_environment()
        yaml_data = CommentedMap()
        yaml_data[self.safe_name] = service_conf
        return yaml_data

    def plugin_config(self):
        config = self.config["metadata"].copy()
        config["name"] = self.name
        config["owner"] = self.owner
        return config

class Plugins(ABC):
    def __init__(self, plugin_type):
        if plugin_type not in PLUGIN_TYPES:
            abort(f"invalid type {plugin_type}")
        self.__type__ = plugin_type
        self.plugins = {}

    def __iter__(self):
        return iter(self.plugins.values())

    @staticmethod
    def load(plugin_type):
        plugins = Plugins(plugin_type)
        config = get_config()
        docker_username = config.get("docker_username")
        init_data_list = config.get(f"{plugin_type.lower()}s") or []
        for init_data in init_data_list:
            plugins.add(Plugin(init_data, plugin_type, docker_username=docker_username))
        return plugins

    def add(self, plugin):
        if plugin.__type__ != self.__type__:
            abort(f"plugin needs to be of type {self.__type__}", plugin.name)
        plugins = self.plugins
        if plugin.name in plugins:
            abort(
                f"there is more than one {self.__type__} plugin with this name",
                plugin.name,
            )
        plugins[plugin.name] = plugin

    def get(self, name):
        return self.plugins.get(name)

    def plugin_config(self):
        return {
            f"{self.__type__}S": {
                plugin.short_safe_name: plugin.plugin_config() for plugin in self.plugins.values()
            }
        }

    @property
    def api_kubernetes_env(self):
        envs = [plugin.url_env for plugin in self]
        return list(dict(zip(("name", "value"), env)) for env in envs)

    def gen_kubernetes(self):
        for plugin in self:
            plugin.gen_kubernetes()
