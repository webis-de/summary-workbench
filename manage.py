#!/usr/bin/env python3

import io
import json
import secrets
import os
import shutil
import tarfile
import base64
from hashlib import sha256
from abc import ABC, abstractmethod
from pathlib import Path

import click
import marshmallow
from marshmallow import Schema, fields, validate
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedBase, CommentedMap
from termcolor import colored

import docker

os.chdir(Path(__file__).absolute().parent)

KUBERNETES_PATH = Path("./deploy")

def abort(messages, origin=None):
    if isinstance(messages, marshmallow.ValidationError):
        failed_fields = messages.args[0]
        print(colored("yaml parsing problem:", "red", attrs=["bold"]))
        for field, error in failed_fields.items():
            (error,) = error
            print(
                "  "
                + colored(f"{field}: ", "red", attrs=["bold"])
                + colored(error, "red")
            )

    else:
        if isinstance(messages, str):
            if origin:
                messages = [[origin, messages]]
            else:
                messages = [messages]
        elif origin:
            messages = [[origin, message] for message in messages]

        for message in messages:
            if isinstance(message, str):
                message = [message]
            if len(message) == 1:
                first = None
                rest = message
            else:
                first, *rest = message
            first = colored(f"{first}: ", "red", attrs=["bold"]) if first else ""
            rest = colored(", ".join(rest), "red")
            print(first + rest)
    exit(1)

def gen_hash(text):
    hasher = sha256()
    hasher.update(text.encode("utf-8"))
    return hasher.digest().hex()



def load_dockerfile_base():
    with open("./docker/Dockerfile") as file:
        return file.read().strip()


def load_yaml(path, json=False, multiple=False):
    typ = "safe" if json else None
    yaml = YAML(typ=typ)
    path = Path(path)
    if multiple:
        return list(yaml.load_all(path))
    return yaml.load(path)


def dump_yaml(data, path, multiple=False):
    path = Path(path)
    yaml = YAML()
    yaml.width = 4096
    yaml.default_flow_style = False
    yaml.indent(mapping=2, offset=2, sequence=4)
    if multiple:
        yaml.dump_all(data, path)
    else:
        yaml.dump(data, path)


def load_config():
    return load_yaml("./config.yaml", json=True)


def remove_comments(data):
    if hasattr(data, "values"):
        values = data.values()
    else:
        values = data
    for value in values:
        comments = data.ca.items
        for key in list(comments.keys()):
            del comments[key]
        if isinstance(value, CommentedBase):
            remove_comments(value)


def add_newlines(data):
    for key in list(data.keys())[1:]:
        data.yaml_set_comment_before_after_key(key, before="\n")


class Volumes:
    def __init__(self):
        self.volumes = {}

    def extend(self, vols):
        for key in vols:
            if key in self.volumes:
                raise ValueError(f"duplicate volume key: {key}")
        self.volumes.update(vols)

    def to_dict(self):
        return self.volumes


def validate_name(name):
    return name.replace("_", "").isalnum()


class PluginSchema(Schema):
    name = fields.Str(
        validate=validate_name,
        error_messages={"validator_failed": "only alphanumeric signs and '_' allowed"},
    )
    readable = fields.Str()
    volumes = fields.List(fields.Str())
    model = fields.Str()
    version = fields.Str()
    devimage = fields.Str(
        validate=validate.OneOf(
            [path.name for path in Path("./docker/images-dev").glob("*")]
        )
    )
    deployimage = fields.Str(
        validate=validate.OneOf(
            [path.name for path in Path("./docker/images-deploy").glob("*")]
        )
    )
    homepage = fields.Url()
    sourcecode = fields.Url()


class MetricPluginSchema(PluginSchema):
    type = fields.Str(validate=validate.OneOf(["lexical", "semantic"]))


class SummarizerPluginSchema(PluginSchema):
    type = fields.Str(validate=validate.OneOf(["abstractive", "extractive"]))


class GlobalConfigSchema(Schema):
    source = fields.Str(required=True)
    environment = fields.Dict(missing={})
    config = fields.Nested(SummarizerPluginSchema)


class GlobalMetricConfigSchema(GlobalConfigSchema):
    config = fields.Nested(MetricPluginSchema)


class GlobalSummarizerConfigSchema(GlobalConfigSchema):
    config = fields.Nested(SummarizerPluginSchema)


class Plugin(ABC):
    def __init__(self, init_data, docker_username=None):
        if isinstance(init_data, str):
            init_data = {"source": init_data}
        try:
            global_config = self.global_config_schema().load(init_data)
        except marshmallow.ValidationError as error:
            abort(error)

        source = global_config["source"]
        self.plugin_path = Path(source).absolute()
        try:
            config_json = load_yaml(self.plugin_path / "config.yaml")
        except FileNotFoundError:
            abort("plugin could not be found", source)

        try:
            config = self.plugin_schema().load(config_json)
        except marshmallow.ValidationError as error:
            abort(error)
        self.config = config

        config.update(global_config.get("config", {}))

        self.docker_username = docker_username

        if not self.name:
            abort("no name is set for the plugin", source)
        if not config.get("version"):
            abort("no version is set for the plugin", self.name)
        if not config.get("readable"):
            abort("no readable name is set for the plugin", self.name)
        if not config.get("type"):
            abort("no type is set for the plugin", self.name)

        config["image"] = f"{self.type.lower()}_{self.name}:latest"
        if "devimage" in config:
            build_path = Path("./docker/images-dev") / config["devimage"]
        else:
            build_path = self.plugin_path / "Dockerfile.dev"
            if not build_path.exists():
                abort("no Dockerfile.dev or devimage was provided", self.name)
        docker_image_path = build_path.absolute()
        config["build"] = {
            "context": str(docker_image_path.parent),
            "dockerfile": str(docker_image_path.name),
        }
        config["working_dir"] = "/app"
        config["host_volumes"] = {
            str(self.plugin_path): "/app",
            str(Path("./plugin_server").absolute()): "/server",
        }
        config["named_volumes"] = {f"{self.name}_root": "/root"}
        environment = {}
        environment.update(global_config.get("environment", {}))
        environment.update({"PLUGIN_NAME": self.name, "PLUGIN_TYPE": self.type})
        model = config.get("model")
        if model:
            environment["PLUGIN_MODEL"] = model
        config["environment"] = environment
        pipfile = self.plugin_path / "Pipfile"
        pipfilelock = self.plugin_path / "Pipfile.lock"
        requirements_file = self.plugin_path / "requirements.txt"

        command = " && ".join(
            [
                "pip install flask",
                "python model_setup.py",
                "cd /server",
                "python wsgi.py",
            ]
        )
        if pipfile.exists() or pipfilelock.exists():
            command = f"pipenv install && pipenv run bash -c '{command}'"
        elif requirements_file.exists():
            command = "pip install -r requirements.txt && " + command
        else:
            abort("neither requirements.txt nor Pipfile exists", self.name)
        config["command"] = f'bash -c "{command}"'


    @abstractmethod
    def global_config_schema(self):
        pass

    @abstractmethod
    def plugin_schema(self):
        pass

    @property
    @abstractmethod
    def type(self):
        pass

    @property
    def version(self):
        return self.config["version"]

    @property
    def frontend_env(self):
        config = self.config
        return {
            "readable": config["readable"],
            "type": config["type"],
        }

    @property
    def deployimage(self):
        return self.config.get("deployimage")

    @property
    def dockerfile(self):
        deployimage = self.deployimage
        if deployimage:
            with open(Path("./docker/images-deploy") / deployimage) as file:
                return file.read()
        with open(self.plugin_path / "Dockerfile") as file:
            return file.read()

    def dockerfile_copy_plugin(self, previous_id):
        dockerfile_parts = []
        dockerfile_parts.append(f"FROM {previous_id}")
        dockerfile_parts.extend([f"ENV {env}" for env in self.environment])
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
    def volumes(self):
        config = self.config
        volumes = config["named_volumes"].copy()
        volumes.update(config["host_volumes"])
        return volumes

    @property
    def name(self):
        return self.config.get("name")

    @property
    def url(self):
        return f"http://{self.name}:5000"

    @property
    def environment(self):
        return list(map(tuple, self.config["environment"].items()))

    @property
    def environment_list(self):
        return list(map("=".join, self.environment))

    @property
    def repository(self):
        return f"{self.docker_username}/{self.name}"

    @property
    def tag(self):
        return f"{self.repository}:{self.version}"

    @property
    def url_env(self):
        return (f"{self.name.upper()}_{self.type}_URL", f"{self.url}")

    def named_volumes_to_config(self):
        return {volume: None for volume in self.config["named_volumes"].keys()}

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

    def gen_kubernetes(self):
        name = self.name
        deployment_name = f"summarizer-{name}"
        port_name = name
        if len(port_name) > 16:
            port_name = name[:11] + gen_hash(name)[:5]
        env = list(dict(zip(("name", "value"), env)) for env in self.environment)
        image_url = self.image_url
        deployment, service = load_yaml("./kubernetes/plugin.yaml", multiple=True)
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
        path = Path(KUBERNETES_PATH / f"{self.type.lower()}/{name}.yaml")
        path.parent.mkdir(parents=True, exist_ok=True)
        dump_yaml([deployment, service], path, multiple=True)

    def to_yaml(self):
        config = self.config
        service_conf = CommentedMap()
        service_conf["image"] = config["image"]
        service_conf["build"] = config["build"]
        service_conf["working_dir"] = config["working_dir"]
        service_conf["volumes"] = list(map(":".join, self.volumes.items()))
        service_conf["command"] = config["command"]
        service_conf["environment"] = self.environment_list
        yaml_data = CommentedMap()
        yaml_data[self.name] = service_conf
        return yaml_data


class MetricPlugin(Plugin):
    def global_config_schema(self):
        return GlobalMetricConfigSchema()

    def plugin_schema(self):
        return MetricPluginSchema()

    @property
    def type(self):
        return "METRIC"


class SummarizerPlugin(Plugin):
    def global_config_schema(self):
        return GlobalSummarizerConfigSchema()

    def plugin_schema(self):
        return SummarizerPluginSchema()

    @property
    def type(self):
        return "SUMMARIZER"


class Plugins(list, ABC):
    @property
    @abstractmethod
    def type(self):
        pass

    @property
    def api_env(self):
        return [(f"{self.type}", ",".join(plugin.name for plugin in self))]

    @property
    def frontend_env(self):
        return [
            (
                f"REACT_APP_{self.type}",
                json.dumps(
                    {plugin.name: plugin.frontend_env for plugin in self},
                    separators=(",", ":"),
                ),
            )
        ]

    @property
    def api_docker_compose_env(self):
        return list(map("=".join, self.api_env))

    @property
    def frontend_docker_compose_env(self):
        return list(map("=".join, self.frontend_env))

    @property
    def api_kubernets_env(self):
        envs = [plugin.url_env for plugin in self]
        envs.extend(self.api_env)
        return list(dict(zip(("name", "value"), env)) for env in envs)

    @property
    def frontend_kubernets_env(self):
        envs = self.frontend_env
        return list(dict(zip(("name", "value"), env)) for env in envs)

    def gen_kubernetes(self):
        for plugin in self:
            plugin.gen_kubernetes()


class MetricPlugins(Plugins):
    @property
    def type(self):
        return "METRICS"


class SummarizerPlugins(Plugins):
    @property
    def type(self):
        return "SUMMARIZERS"


def get_plugins():
    config = load_config()
    docker_username = config.get("docker_username")
    metrics = config.get("metrics") or []
    summarizers = config.get("summarizers") or []
    metric_plugins = MetricPlugins(
        MetricPlugin(metric, docker_username=docker_username) for metric in metrics
    )
    summarizer_plugins = SummarizerPlugins(
        SummarizerPlugin(summarizer, docker_username=docker_username)
        for summarizer in summarizers
    )
    return metric_plugins, summarizer_plugins


def init_compose_file():
    compose_data = CommentedMap()
    compose_data["version"] = "3"

    volumes = Volumes()
    part_files = sorted(Path("./docker").glob("*.yaml"))
    services_data = CommentedMap()
    for part_file in part_files:
        part_data = load_yaml(part_file)
        if "volumes" in part_data:
            volumes.extend(part_data.pop("volumes"))
        services_data.update(part_data)
    return compose_data, services_data, volumes


def _gen_docker_compose():
    compose_data, services_data, volumes = init_compose_file()
    metric_plugins, summarizer_plugins = get_plugins()

    for plugin in metric_plugins + summarizer_plugins:
        volumes.extend(plugin.named_volumes_to_config())
        services_data["api"]["environment"].append("=".join(plugin.url_env))
        services_data.update(plugin.to_yaml())

    api_environment = services_data["api"]["environment"]
    api_environment.extend(metric_plugins.api_docker_compose_env)
    api_environment.extend(summarizer_plugins.api_docker_compose_env)

    frontend_environment = services_data["frontend"]["environment"]
    frontend_environment.extend(metric_plugins.frontend_docker_compose_env)
    frontend_environment.extend(summarizer_plugins.frontend_docker_compose_env)

    compose_data["services"] = services_data
    compose_data["volumes"] = volumes.to_dict()

    remove_comments(compose_data)
    add_newlines(services_data)
    add_newlines(compose_data)
    dump_yaml(compose_data, Path("./docker-compose.yaml"))


class Docker:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except docker.errors.DockerException:
            abort("the docker service is not running", "docker")
        self.metric_plugins, self.summarizer_plugins = get_plugins()
        self.api = Api()
        self.frontend = Frontend()

    @staticmethod
    def print_images(plugins):
        print(colored(plugins.type.lower(), "green"))
        for plugin in plugins:
            print(f"  {plugin.name} (version: {plugin.version})")
        print()

    @property
    def plugins(self):
        return self.metric_plugins + self.summarizer_plugins

    @property
    def base_services(self):
        return [self.api, self.frontend]

    @property
    def services(self):
        return self.base_services + self.plugins

    def get_image(self, name):
        for service in self.services:
            if service.name == name:
                return service

    def print_base_images(self):
        print(colored("base", "green"))
        for service in self.base_services:
            print(f"  {service.type} (version: {service.version})")
        print()

    def list_images(self):
        self.print_base_images()
        self.print_images(self.metric_plugins)
        self.print_images(self.summarizer_plugins)

    def exists(self, image):
        try:
            self.client.images.get(image)
            return True
        except docker.errors.ImageNotFound:
            return False


    def build(self, name, force):
        service = self.get_image(name)
        if not service:
            abort(f"service '{name}' does not exit", "build")
        if not force and self.exists(service.tag):
            service_tag = colored(service.tag, "green")
            print(f"image {service_tag} already present")
        else:
            service.build()

    def build_all(self, force):
        for service in self.services:
            if not force and self.exists(service.tag):
                service_tag = colored(service.tag, "green")
                print(f"image {service_tag} already present")
            else:
                service.build()

    def push(self, name):
        service = self.get_image(name)
        if not service:
            abort(f"service '{name}' does not exit", "push")
        service.push()

    def push_all(self):
        for service in self.services:
            service.push()


class Service(ABC):
    PLUGINS = None
    CONFIG = None

    def __init__(self):
        if not self.CONFIG:
            self.CONFIG = load_config()
        if not self.PLUGINS:
            self.PLUGINS = get_plugins()

    @property
    def name(self):
        return self.type

    @property
    def version(self):
        try:
            return self._version
        except AttributeError:
            _version = load_yaml(f"./{self.type}/config.yaml", json=True).get("version")
            if not _version:
                abort("version is missing", "config")
            self._version = _version
            return _version

    @property
    def docker_username(self):
        try:
            return self._docker_username
        except AttributeError:
            _docker_username = self.CONFIG.get("docker_username")
            if not _docker_username:
                abort("docker_username needs to be defined for tagging the image", self.name)
            self._docker_username = _docker_username
            return _docker_username

    @property
    def nodeport(self):
        try:
            return self._nodeport
        except AttributeError:
            deploy = self.CONFIG.get("deploy")
            _nodeport = deploy.get("nodeport") if deploy else None
            if not _nodeport:
                abort("deploy nodeport needs to be defined", "kubernetes")
            self._nodeport = _nodeport
            return _nodeport

    @property
    @abstractmethod
    def type(self):
        pass

    @property
    def path(self):
        raise NotImplementedError()

    @property
    def repository(self):
        return f"{self.docker_username}/tldr-{self.name}"

    @property
    def tag(self):
        return f"{self.repository}:{self.version}"

    @property
    def image_url(self):
        return f"docker.io/{self.tag}"


    def build(self):
        colored_tag = colored(self.tag, "green")
        print(f"building " + colored_tag)

        client = docker.from_env()
        for status in client.api.build(path=self.path, decode=True):
            error = status.get("error")
            if error:
                abort(error, self.name)
            stream = status.get("stream")
            if stream:
                print(stream, end="")
        image = client.images.build(path=self.path)[0]
        image.tag(self.tag)
        print(f"done building " + colored_tag)

    def push(self):
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


class Api(Service):
    @property
    def type(self):
        return "api"

    @property
    def path(self):
        return "./api/"

    def gen_kubernetes(self):
        metric_plugins, summarizer_plugins = self.PLUGINS

        docs = load_yaml(f"./kubernetes/basic/{self.type}.yaml", multiple=True)
        container = docs[0]["spec"]["template"]["spec"]["containers"][0]
        container["image"] = self.image_url
        env = container["env"]
        env.extend(metric_plugins.api_kubernets_env)
        env.extend(summarizer_plugins.api_kubernets_env)

        path = Path(KUBERNETES_PATH / f"services/basic/{self.type}.yaml")
        path.parent.mkdir(exist_ok=True, parents=True)
        dump_yaml(docs, path, multiple=True)


class Frontend(Service):
    @property
    def type(self):
        return "frontend"

    @property
    def path(self):
        return "./frontend/"

    def gen_kubernetes(self):
        metric_plugins, summarizer_plugins = self.PLUGINS

        docs = load_yaml(f"./kubernetes/basic/{self.type}.yaml", multiple=True)
        container = docs[0]["spec"]["template"]["spec"]["containers"][0]
        container["image"] = self.image_url
        env = container["env"]
        env.extend(metric_plugins.frontend_kubernets_env)
        env.extend(summarizer_plugins.frontend_kubernets_env)

        path = Path(KUBERNETES_PATH / f"services/basic/{self.type}.yaml")
        path.parent.mkdir(exist_ok=True, parents=True)
        dump_yaml(docs, path, multiple=True)


class MongoDB(Service):
    @property
    def type(self):
        return "mongodb"

    def gen_kubernetes(self):
        shutil.copyfile(
            f"./kubernetes/basic/{self.type}.yaml",
            KUBERNETES_PATH / f"services/basic/{self.type}.yaml",
        )


class Proxy(Service):
    @property
    def type(self):
        return "proxy"

    def gen_kubernetes(self):
        docs = load_yaml(f"./kubernetes/basic/{self.type}.yaml", multiple=True)
        port = docs[2]["spec"]["ports"][0]
        port["nodePort"] = self.nodeport

        path = Path(KUBERNETES_PATH / f"services/basic/{self.type}.yaml")
        path.parent.mkdir(exist_ok=True, parents=True)
        dump_yaml(docs, path, multiple=True)

def gen_secret(nbytes):
    return base64.b64encode(secrets.token_bytes(nbytes)).decode("ascii")


def gen_token_secrets(nbytes=256):
    token_secrets = load_yaml(f"./kubernetes/token_secrets.yaml")
    data = token_secrets["data"]
    data["access-token-secret"] = gen_secret(nbytes)
    data["refresh-token-secret"] = gen_secret(nbytes)
    dump_yaml(token_secrets, KUBERNETES_PATH / "token_secrets.yaml")


def _gen_kubernetes():
    Api().gen_kubernetes()
    Frontend().gen_kubernetes()
    MongoDB().gen_kubernetes()
    Proxy().gen_kubernetes()

    metric_plugins, summarizer_plugins = get_plugins()
    metric_plugins.gen_kubernetes()
    summarizer_plugins.gen_kubernetes()


@click.command()
@click.option("--secrets", is_flag=True)
def gen_kubernetes(secrets):
    if secrets:
        gen_token_secrets()
    else:
        _gen_kubernetes()


@click.command()
@click.option("--all", is_flag=True)
@click.option("--force", is_flag=True)
@click.argument("names", nargs=-1)
def build(names, force, all):
    docker = Docker()
    if all:
        docker.build_all(force)
    elif not names:
        print("give the name of the service to build or --all for all")
        docker.list_images()
    else:
        for name in names:
            docker.build(name, force)


@click.command()
@click.option("--all", is_flag=True)
@click.argument("name", default="")
def push(name, all):
    docker = Docker()
    if all:
        docker.push_all()
    elif not name:
        print("give the name of the plugin to push or --all for all")
        docker.list_images()
    else:
        docker.push(name)


@click.command()
def gen_docker_compose():
    _gen_docker_compose()


@click.group()
def main():
    pass


main.add_command(gen_docker_compose)
main.add_command(gen_kubernetes)
main.add_command(build)
main.add_command(push)

if __name__ == "__main__":
    main()
