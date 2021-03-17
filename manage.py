#!/usr/bin/env python3

import os
import string
from abc import ABC, abstractmethod
from collections import OrderedDict
from pathlib import Path

import click
import marshmallow
from marshmallow import Schema, fields, validate
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedBase, CommentedMap
from termcolor import colored

os.chdir(Path(__file__).absolute().parent)


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


def load_yaml(path):
    return YAML(typ="safe").load(Path(path))


def load_config():
    return load_yaml("./config.yaml")


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


class PluginConfigSchema(Schema):
    name = fields.Str(
        validate=validate_name,
        error_messages={"validator_failed": "only alphanumeric signs and '_' allowed"},
    )
    readable = fields.Str()
    volumes = fields.List(fields.Str())
    version = fields.Str()
    devimage = fields.Str(
        validate=validate.OneOf(
            [path.name for path in Path("./docker/images").glob("*")]
        )
    )


class GlobalConfigSchema(Schema):
    source = fields.Str(required=True)
    environment = fields.Dict(missing={})
    config = fields.Nested(PluginConfigSchema)


class Plugin(ABC):
    def __init__(self, init_data):
        if isinstance(init_data, str):
            init_data = {"source": init_data}
        try:
            global_config = GlobalConfigSchema().load(init_data)
        except marshmallow.ValidationError as error:
            abort(error)

        source = global_config["source"]
        self.plugin_path = Path(source).absolute()
        config_json = load_yaml(self.plugin_path / "config.yaml")

        try:
            config = PluginConfigSchema().load(config_json)
        except marshmallow.ValidationError as error:
            abort(error)
        self.config = config

        config.update(global_config.get("config", {}))

        if not self.name:
            abort("no name is set for the plugin", source)

        config["image"] = f"{self.name}:latest"
        build_path = self.plugin_path / "Dockerfile.dev"
        if not build_path.exists():
            if not "devimage" in config:
                abort("no Dockerfile.dev or devimage was provided", self.name)
            build_path = Path("./docker/images") / config["devimage"]
        docker_image_path = build_path.absolute()
        config["build"] = {
            "context": str(docker_image_path.parent),
            "dockerfile": str(docker_image_path.name),
        }
        config["working_dir"] = "/app"
        config["host_volumes"] = {
            str(self.plugin_path): "/app",
            str(Path("./plugin_server").absolute()): "/app/server",
        }
        config["named_volumes"] = {f"{self.name}_root": "/root"}
        environment = global_config.get("environment", {})
        environment.update({"PLUGIN_NAME": self.name, "PLUGIN_TYPE": self.type})
        config["environment"] = environment
        pipfile = self.plugin_path / "Pipfile"
        pipfilelock = self.plugin_path / "Pipfile.lock"
        requirements_file = self.plugin_path / "requirements.txt"

        command = " && ".join(
            [
                "pip install flask",
                "python model_setup.py",
                "cd server",
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

    @property
    @abstractmethod
    def type(self):
        pass

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
        return list(map("=".join, self.config["environment"].items()))

    def url_env(self):
        return f"{self.name.upper()}_{self.type}_URL={self.url}"

    def named_volumes_to_config(self):
        return {volume: None for volume in self.config["named_volumes"].keys()}

    def to_yaml(self):
        config = self.config
        service_conf = CommentedMap()
        service_conf["image"] = config["image"]
        service_conf["build"] = config["build"]
        service_conf["working_dir"] = config["working_dir"]
        service_conf["volumes"] = list(map(":".join, self.volumes.items()))
        service_conf["command"] = config["command"]
        service_conf["environment"] = self.environment
        yaml_data = CommentedMap()
        yaml_data[self.name] = service_conf
        return yaml_data


class MetricPlugin(Plugin):
    def __init__(self, init_data):
        super().__init__(init_data)

        self.config["host_volumes"].update(
            {
                str(self.plugin_path / "metric"): "/app/server/metric",
            }
        )

    @property
    def type(self):
        return "METRIC"


class SummarizerPlugin(Plugin):
    def __init__(self, init_data):
        super().__init__(init_data)

        self.config["host_volumes"].update(
            {
                str(self.plugin_path / "summarizer"): "/app/server/summarizer",
            }
        )

    @property
    def type(self):
        return "SUMMARIZER"


def gen_docker_compose():
    yaml = YAML()
    yaml.width = 4096
    yaml.default_flow_style = False
    yaml.indent(mapping=2, offset=2)
    volumes = Volumes()
    config = load_config()

    metrics = config.get("metrics") or []
    summarizers = config.get("summarizers") or []
    metric_plugins = [MetricPlugin(metric) for metric in metrics]
    summarizer_plugins = [SummarizerPlugin(summarizer) for summarizer in summarizers]

    compose_data = CommentedMap()
    compose_data["version"] = "3"
    services_data = CommentedMap()

    part_files = sorted(Path("./docker").glob("*.yaml"))
    for part_file in part_files:
        service_data = yaml.load(part_file)
        if "volumes" in service_data:
            volumes.extend(service_data.pop("volumes"))
        services_data.update(service_data)

    for plugin in metric_plugins + summarizer_plugins:
        volumes.extend(plugin.named_volumes_to_config())
        services_data["api"]["environment"].append(plugin.url_env())
        services_data.update(plugin.to_yaml())

    metrics_env = "METRICS=" + ",".join([plugin.name for plugin in metric_plugins])
    summarizers_env = "SUMMARIZERS=" + ",".join([plugin.name for plugin in summarizer_plugins])
    for service in ("api", "frontend"):
        environment = services_data[service]["environment"]
        environment.append(metrics_env)
        environment.append(summarizers_env)

    compose_data["services"] = services_data
    compose_data["volumes"] = volumes.to_dict()

    remove_comments(compose_data)
    add_newlines(services_data)
    add_newlines(compose_data)
    yaml.dump(compose_data, Path("./docker-compose.yaml"))


@click.command()
def kubernetes():
    pass


@click.command()
def build():
    pass


@click.command()
def push():
    pass


@click.command()
def dev():
    gen_docker_compose()


@click.group()
def main():
    pass


main.add_command(dev)

if __name__ == "__main__":
    main()
