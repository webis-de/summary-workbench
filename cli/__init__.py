import base64
import json
import os
import secrets
import shutil
from abc import ABC, abstractmethod
from pathlib import Path

import click
import docker
import ruamel
from ruamel.yaml.comments import CommentedMap
from termcolor import colored

from .config import CONFIG_PATH, KUBERNETES_PATH
from .plugins import (Plugin, Plugins)
from .utils import (abort, add_newlines, dump_yaml, get_config, load_yaml,
                    remove_comments)

os.chdir(Path(__file__).absolute().parent.parent)


class Volumes:
    def __init__(self):
        self.volumes = {}

    def extend(self, vols):
        for key in vols:
            if key in self.volumes:
                raise ValueError(f"duplicate volume key: {key}")
        self.volumes.update(vols)

    def to_dict(self):
        return self.volumes.copy()


def get_plugins():
    metric_plugins = Plugins.load("METRIC")
    summarizer_plugins = Plugins.load("SUMMARIZER")
    return metric_plugins, summarizer_plugins


def init_compose_file():
    compose_data = CommentedMap()
    compose_data["version"] = "3"

    volumes = Volumes()
    part_files = sorted(Path("./templates/docker").glob("*.yaml"))
    services_data = CommentedMap()
    for part_file in part_files:
        part_data = load_yaml(part_file)
        if "volumes" in part_data:
            volumes.extend(part_data.pop("volumes"))
        services_data.update(part_data)
    return compose_data, services_data, volumes


def gen_plugin_config(plugins_list):
    plugin_config = {}
    for plugins in plugins_list:
        plugin_config.update(plugins.plugin_config())
    return json.dumps(plugin_config, indent=2)


def _gen_docker_compose():
    compose_data, services_data, volumes = init_compose_file()
    metric_plugins, summarizer_plugins = get_plugins()

    for plugin in list(metric_plugins) + list(summarizer_plugins):
        volumes.extend(plugin.named_volumes_to_config())
        services_data["api"]["environment"].append("=".join(plugin.url_env))
        services_data.update(plugin.to_yaml())

    plugin_config = gen_plugin_config([metric_plugins, summarizer_plugins])
    with open("./api/plugin_config.json", "w") as file:
        file.write(plugin_config)

    compose_data["services"] = services_data
    compose_data["volumes"] = volumes.to_dict()

    remove_comments(compose_data)
    add_newlines(services_data)
    add_newlines(compose_data)
    dump_yaml(compose_data, Path("./docker-compose.yaml"))


class Service(ABC):
    __type__ = None
    __deploy_path__ = KUBERNETES_PATH / "basic"

    def __init__(self):
        if not self.__type__:
            abort("trying to instantiate abstract service")
        self.config = get_config()
        self.path = f"./{self.__type__}/"
        self.name = self.__type__
        with open(f"./{self.__type__}/package.json") as file:
            self.version= json.load(file)["version"]
        self.host = self.config.get("deploy", {}).get("host")

    def docker_username(self):
        try:
            return self.config["docker_username"]
        except AttributeError:
            abort("docker_username needs to be defined for tagging the image", self.name())

    def nodeport(self):
        try:
            return self.config["deploy"]["nodeport"]
        except AttributeError:
            abort("deploy nodeport needs to be defined", "kubernetes")

    def repository(self):
        return f"{self.docker_username()}/tldr-{self.name}"

    def tag(self):
        return f"{self.repository()}:{self.version}"

    def image_url(self):
        return f"docker.io/{self.tag()}"

    def build(self):
        colored_tag = colored(self.tag(), "green")
        print(f"building " + colored_tag)

        with open(Path(self.path) / "Dockerfile", "r") as file:
            print(colored("--- DOCKERFILE BEGIN ---", "yellow"))
            print(file.read())
            print(colored("--- DOCKERFILE END   ---", "yellow"))

        client = docker.from_env()
        for status in client.api.build(path=self.path, decode=True):
            error = status.get("error")
            if error:
                abort(error, self.name)
            stream = status.get("stream")
            if stream:
                print(stream, end="")
        image = client.images.build(path=self.path)[0]
        image.tag(self.tag())
        print(f"done building " + colored_tag)

    def push(self):
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


class Api(Service):
    __type__ = "api"

    def gen_kubernetes(self, plugin_envs, plugin_config):
        docs = load_yaml(
            f"./templates/kubernetes/basic/{self.__type__}.yaml", multiple=True
        )
        docs[0]["data"] = {
            "plugin_config.json": ruamel.yaml.scalarstring.PreservedScalarString(
                plugin_config
            )
        }
        container = docs[1]["spec"]["template"]["spec"]["containers"][0]
        container["image"] = self.image_url()
        container["env"].extend(plugin_envs)

        path = Path(self.__deploy_path__ / f"{self.__type__}.yaml")
        path.parent.mkdir(exist_ok=True, parents=True)
        dump_yaml(docs, path, multiple=True)


class Frontend(Service):
    __type__ = "frontend"

    def gen_kubernetes(self):
        docs = load_yaml(
            f"./templates/kubernetes/basic/{self.__type__}.yaml", multiple=True
        )
        container = docs[0]["spec"]["template"]["spec"]["containers"][0]
        container["image"] = self.image_url()

        path = Path(self.__deploy_path__ / f"{self.__type__}.yaml")
        path.parent.mkdir(exist_ok=True, parents=True)
        dump_yaml(docs, path, multiple=True)

class Ingress(Service):
    __type__ = "ingress"

    def gen_kubernetes(self):
        if not self.host():
            return
        ingress = load_yaml(
            f"./templates/kubernetes/basic/{self.__type__}.yaml"
        )
        ingress["spec"]["rules"][0]["host"] = self.host()
        path = Path(self.__deploy_path__ / f"{self.__type__}.yaml")
        path.parent.mkdir(exist_ok=True, parents=True)
        dump_yaml(ingress, path)


class MongoDB(Service):
    __type__ = "mongodb"

    def gen_kubernetes(self):
        shutil.copyfile(
            f"./templates/kubernetes/basic/{self.__type__}.yaml",
            Path(self.__deploy_path__ / f"{self.__type__}.yaml"),
        )


class Proxy(Service):
    __type__ = "proxy"

    def gen_kubernetes(self):
        docs = load_yaml(
            f"./templates/kubernetes/basic/{self.__type__}.yaml", multiple=True
        )
        port = docs[2]["spec"]["ports"][0]
        port["nodePort"] = self.nodeport()

        path = Path(self.__deploy_path__ / f"{self.__type__}.yaml")
        path.parent.mkdir(exist_ok=True, parents=True)
        dump_yaml(docs, path, multiple=True)


class BaseServices(dict):
    def __init__(self):
        for cls in (Api, Frontend):
            self[cls.__type__] = cls()

    def __iter__(self):
        return iter(self.values())


class Docker:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except docker.errors.DockerException:
            abort("the docker service is not running", "docker")
        self.services = {
            "base": BaseServices(),
            "metric": Plugins.load("METRIC"),
            "summarizer": Plugins.load("SUMMARIZER"),
        }

    def print_images(self, service_type):
        print(colored(service_type, "green"))
        for service in self.services[service_type]:
            print(f"  {service.name} (version: {service.version})")
        print()

    def get_service(self, name):
        components = name.split(":")
        if len(components) == 2:
            plugin_type, name = components
            services = self.services.get(plugin_type)
            if not services:
                abort(f"there is no type {plugin_type}", name)
            return services.get(name)
        mult_service = []
        found_service = None
        for service_type, services in self.services.items():
            service = services.get(name)
            if service is not None:
                found_service = service
                mult_service.append(service_type)
        if len(mult_service) > 1:
            commands = ", ".join(
                f"build {service_type}:{name}" for service_type in mult_service
            )
            abort(
                f"there are multiple services with the name {name}, build one with one of the following commands: {commands}",
                name,
            )
        return found_service

    def list_images(self):
        for key in self.services.keys():
            self.print_images(key)

    def exists(self, image):
        try:
            self.client.images.get(image)
            return True
        except docker.errors.ImageNotFound:
            return False

    def build(self, name, force=False):
        service = self.get_service(name)
        if not service:
            abort(f"service '{name}' does not exit", "build")
        if not force and self.exists(service.tag()):
            service_tag = colored(service.tag(), "green")
            print(f"image {service_tag} already present")
        else:
            service.build()

    def build_all(self, force):
        for services in self.services.values():
            for service in services:
                if not force and self.exists(service.tag):
                    service_tag = colored(service.tag, "green")
                    print(f"image {service_tag} already present")
                else:
                    service.build()

    def push(self, name):
        service = self.get_service(name)
        if not service:
            abort(f"service '{name}' does not exit", "push")
        service.push()

    def push_all(self):
        for services in self.services.values():
            for service in services:
                service.push()


def gen_secret(nbytes):
    return base64.b64encode(secrets.token_bytes(nbytes)).decode("ascii")


def gen_token_secrets(nbytes=256):
    token_secrets = load_yaml(f"./templates/kubernetes/token_secrets.yaml")
    data = token_secrets["stringData"]
    data["access-token-secret"] = gen_secret(nbytes)
    data["refresh-token-secret"] = gen_secret(nbytes)
    dump_yaml(token_secrets, KUBERNETES_PATH / "token_secrets.yaml")


def _gen_kubernetes():
    metric_plugins, summarizer_plugins = get_plugins()
    api_env = metric_plugins.api_kubernetes_env + summarizer_plugins.api_kubernetes_env
    shutil.rmtree("./deploy/basic", ignore_errors=True)
    shutil.rmtree("./deploy/metrics", ignore_errors=True)
    shutil.rmtree("./deploy/summarizers", ignore_errors=True)
    Api().gen_kubernetes(
        api_env, gen_plugin_config([metric_plugins, summarizer_plugins])
    )
    Frontend().gen_kubernetes()
    MongoDB().gen_kubernetes()
    Proxy().gen_kubernetes()
    Ingress().gen_kubernetes()
    shutil.copyfile(
        f"./templates/kubernetes/volumes.yaml",
        KUBERNETES_PATH / "volumes.yaml",
    )
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
        print("give the names of the services to build or --all for all")
        docker.list_images()
    else:
        for name in names:
            docker.build(name, force=force)


@click.command()
@click.option("--all", is_flag=True)
@click.argument("names", nargs=-1)
def push(names, all):
    docker = Docker()
    if all:
        docker.push_all()
    elif not names:
        print("give the names of the plugins to push or --all for all")
        docker.list_images()
    else:
        for name in names:
            docker.push(name)


@click.command()
def gen_docker_compose():
    _gen_docker_compose()


@click.group()
@click.option("--config", default="./config.yaml")
def main(config):
    CONFIG_PATH["path"] = config
    pass


main.add_command(gen_docker_compose)
main.add_command(gen_kubernetes)
main.add_command(build)
main.add_command(push)
