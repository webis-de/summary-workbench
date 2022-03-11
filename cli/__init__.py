import os
from pathlib import Path

os.chdir(Path(__file__).absolute().parent.parent)

import json
import shutil

import click
from termcolor import colored

from .config import (CONFIG_PATH, DEPLOY_PATH, DOCKER_COMPOSE_YAML_PATH,
                     DOCKER_TEMPLATES_PATH, KUBERNETES_TEMPLATES_PATH,
                     PLUGIN_CONFIG_PATH)
from .docker_interface import Docker, DockerMixin
from .exceptions import BaseManageError, DoubleServicesError
from .plugins import Plugins
from .utils import Yaml, dict_path, gen_secret, get_config


def remove_old_deploy_files():
    for path in DEPLOY_PATH.glob("*"):
        if path.is_dir():
            shutil.rmtree(path, ignore_errors=True)


class ComposeFile:
    def __init__(self, plugins):
        self.compose_data = {"version": "3", "services": {}, "volumes": {}}
        self.populate_templates()
        for plugin in plugins:
            self.add_service_from_plugin(plugin)

    def populate_templates(self):
        service_files = sorted(DOCKER_TEMPLATES_PATH.glob("*.yaml"))
        for path in service_files:
            self.add_service_from_file(path)

    def add_volumes(self, volumes):
        compose_volumes = self.compose_data["volumes"]
        for key in volumes.keys():
            if key in compose_volumes:
                raise ValueError(f"{key} is already present")
        compose_volumes.update(volumes)

    def add_service(self, service):
        self.add_volumes(service.pop("volumes", {}))
        self.compose_data["services"].update(service)

    def add_service_from_file(self, path):
        self.add_service(Yaml.load(path, json=True))

    def add_service_from_plugin(self, plugin):
        self.add_volumes(plugin.docker_compose_named_volumes)
        self.add_environment("api", plugin.docker_compose_url_env)
        self.add_service(plugin.to_service())

    def add_environment(self, service_name, environment):
        self.compose_data["services"][service_name]["environment"].extend(environment)

    def save(self):
        Yaml(self.compose_data).dump(DOCKER_COMPOSE_YAML_PATH, space_keys=["services"])


class PluginConfig:
    def __init__(self, plugins):
        self.config = plugins.plugin_config()

    def __str__(self):
        return json.dumps(self.config, indent=2)

    def save(self):
        with open(PLUGIN_CONFIG_PATH, "w") as f:
            json.dump(self.config, f, indent=2)


class NodeMixin:
    def get_version(self):
        package_json_path = self.path / "package.json"
        if package_json_path.exists():
            with open(package_json_path) as file:
                return json.load(file)["version"]

    def build_chain_args(self):
        return [
            {
                "dockerfile": (self.path / "Dockerfile").read_text(),
                "context_path": self.path,
            }
        ]


class Service(DockerMixin):
    def __init__(self, service_type, sub_path="basic"):
        self.path = Path(f"./{service_type}")
        self.name, self.owner = service_type, ""

        filename = f"{service_type}.yaml"
        DockerMixin.__init__(
            self,
            deploy_src=KUBERNETES_TEMPLATES_PATH / sub_path / filename,
            deploy_dest=DEPLOY_PATH / sub_path / filename,
            docker_username=get_config().docker_username,
            name=service_type,
            image_url=None,  # TODO: make configurable
        )


class Api(NodeMixin, Service):
    def __init__(self):
        Service.__init__(self, "api")

    def patch(self):
        plugins = Plugins.load()
        return {
            0: dict_path(
                ["data", "plugin_config.json"], Yaml.PreservedString(str(PluginConfig(plugins)))
            ),
            1: dict_path(
                ["spec", "template", "spec", "containers", 0],
                {
                    "image": self.image_url,
                    "env": plugins.api_kubernetes_env(),  # TODO: extend
                },
            ),
        }


class Frontend(NodeMixin, Service):
    def __init__(self):
        Service.__init__(self, "frontend")

    def patch(self):
        return dict_path(
            [0, "spec", "template", "spec", "containers", 0, "image"], self.image_url
        )


class Ingress(Service):
    def __init__(self):
        super().__init__("ingress")

    def patch(self):
        return dict_path(["spec", "rules", 0, "host"], get_config().deploy.host)


class Proxy(Service):
    def __init__(self):
        super().__init__("proxy")


class Mongodb(Service):
    def __init__(self):
        super().__init__("mongodb")


class Volumes(Service):
    def __init__(self):
        super().__init__("volumes", "")


SERVICES_THAT_NEED_BUILD = [Api, Frontend]


def extract_qualified_name(qualified_name):
    components = qualified_name.split(":")
    try:
        (name,) = components
        return (name,)
    except ValueError:
        try:
            plugin_type, name = components
            return name, plugin_type
        except ValueError:
            try:
                plugin_type, owner, name = components
                return name, plugin_type, owner
            except ValueError:
                raise BaseException(
                    f"name {qualified_name} has too many components", ""
                )


def collect(root):
    collected = []
    if not isinstance(root, dict):
        return [([], root)]
    for key, sub_root in root.items():
        for l, e in collect(sub_root):
            if l or len(root) > 1:
                collected.append(([key] + l, e))
            else:
                collected.append((l, e))
    return collected


def qualified_collect(root, pre_components=None):
    collected = collect(root)
    if pre_components is not None:
        pre_components = list(pre_components)
        collected = [(pre_components + l, e) for l, e in collected]
    return collected


def reduce_path(path):
    try:
        (name,) = path
        return name
    except ValueError:
        try:
            name, plugin_type = path
            return f"{plugin_type}:{name}"
        except ValueError:
            name, plugin_type, owner = path
            return f"{plugin_type}:{owner}:{name}"


class ServiceManager:
    def __init__(self):
        self.docker = Docker()
        self.services_by_type = {
            "base": [service() for service in SERVICES_THAT_NEED_BUILD],
            **Plugins.load().to_dict(),
        }
        self.services = {}
        for service_type, services in self.services_by_type.items():
            for service in services:
                service_map = self.services.setdefault(service.name, {}).setdefault(
                    service_type, {}
                )  # TODO: safe name bzw. avoid collision
                # TODO: also integrate save name into frontend
                if service.owner in service_map:
                    raise DoubleServicesError(
                        f"{service_type} service {service.name} for user '{service.owner}' is configured twice",
                    )
                service_map[service.owner] = service
                # TODO: test owner collision with external plugin

    def print_images(self):
        for service_type, services in self.services_by_type.items():
            print(colored(service_type, "green"))
            for service in services:
                version = colored(f"version: {service.get_version()}", "yellow")
                service_string = f"  {service.name} ({version})"
                if service.owner != "":
                    owner = colored(f"owner: {service.owner}", "blue")
                    service_string += f" ({owner})"
                print(service_string)
            print()

    def get_service(self, qualified_name):
        path = extract_qualified_name(qualified_name)
        service_root = self.services
        try:
            for key in path:
                service_root = service_root[key]
        except KeyError:
            raise BaseManageError("no service found for this key", qualified_name)
        services = qualified_collect(service_root, path)
        if not services:
            raise BaseException(f"no service was found for key {qualified_name}")
        if len(services) == 1:
            return services[0][1]
        raise BaseException(
            f"there are multiple services with the name {qualified_name}, use the following names to resolve: {', '.join(reduce_path)}"
        )

    def _build(self, service, force):
        if not force and Docker().exists(service.tag):
            print(f"image {colored(service.tag, 'green')} already present")
        else:
            service.build()

    def build(self, name, force=False):
        service = self.get_service(name)
        self._build(service, force)

    def build_all(self, force=False):
        for services in self.services.values():
            for service in services:
                self._build(service, force)

    def push(self, name):
        service = self.get_service(name)
        service.push()

    def push_all(self):
        for services in self.services.values():
            for service in services:
                service.push()

    def gen_docker_compose(_):
        plugins = Plugins.load()
        ComposeFile(plugins).save()
        PluginConfig(plugins).save()

    def gen_kubernetes(_):
        if get_config().deploy is None:
            raise BaseManageError(
                "the 'deploy' key in your config is not present or is None, but is required for the deployment generation"
            )
        remove_old_deploy_files()
        for service in [
            Api(),
            Frontend(),
            Ingress(),
            Mongodb(),
            Proxy(),
            Volumes(),
            Plugins.load(),
        ]:
            service.gen_kubernetes()

    @staticmethod
    def gen_token_secrets(nbytes=256):
        token_secrets = Yaml.load(KUBERNETES_TEMPLATES_PATH / "token_secrets.yaml")
        token_secrets.extend(
            {
                "stringData": {
                    "access-token-secret": gen_secret(nbytes),
                    "refresh-token-secret": gen_secret(nbytes),
                }
            }
        )
        token_secrets.dump(DEPLOY_PATH / "token_secrets.yaml")


@click.command()
@click.option("--all", is_flag=True)
@click.option("--force", is_flag=True)
@click.argument("names", nargs=-1)
def build(names, force, all):
    manager = ServiceManager()
    if all:
        manager.build_all(force)
    elif not names:
        print("give the names of the services to build or --all for all")
        manager.print_images()
    else:
        for name in names:
            manager.build(name, force=force)


@click.command()
@click.option("--all", is_flag=True)
@click.argument("names", nargs=-1)
def push(names, all):
    manager = ServiceManager()
    if all:
        manager.push_all()
    elif not names:
        print("give the names of the plugins to push or --all for all")
        manager.print_images()
    else:
        for name in names:
            manager.push(name)


@click.command()
def gen_docker_compose():
    ServiceManager().gen_docker_compose()


@click.command()
@click.option("--secrets", is_flag=True)
def gen_kubernetes(secrets):
    manager = ServiceManager()
    if secrets:
        manager.gen_token_secrets()
    else:
        manager.gen_kubernetes()


@click.group()
@click.option("--config", default="./config.yaml")
def _main(config):
    CONFIG_PATH["path"] = config
    pass


_main.add_command(gen_docker_compose)
_main.add_command(gen_kubernetes)
_main.add_command(build)
_main.add_command(push)


def main():
    try:
        _main()
    except BaseManageError as error:
        error.print()
