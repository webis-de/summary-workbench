#!/usr/bin/env python3

import os
import string
from pathlib import Path
from collections import OrderedDict

import click
from marshmallow import Schema, fields
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap, CommentedBase

os.chdir(Path(__file__).absolute().parent)


def load_yaml(path):
    return YAML(typ="safe").load(Path(path))


def load_config():
    return load_yaml("./config.yaml")


#     - BERT_URL=http://bert:5000


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

class GlobalConfigSchema(Schema):
    source = fields.Str(required=True)
    name = fields.Str(validate=validate_name, error_messages={"validator_failed": "only alphanumeric signs and '_' allowed"})
    readable = fields.Str()
    environment = fields.Dict()


class PythonSchema(Schema):
    version = fields.Str()
    slim = fields.Bool()


class PluginConfigSchema(Schema):
    name = fields.Str(validate=validate_name, error_messages={"validator_failed": "only alphanumeric signs and '_' allowed"})
    readable = fields.Str()
    persist = fields.Str()
    image = fields.Str()
    python = fields.Nested(PythonSchema)


class MetricPlugin:
    def __init__(self, init_data):
        if isinstance(init_data, str):
            init_data = {"source": init_data}
        global_config = GlobalConfigSchema().load(init_data)
        plugin_path = Path(global_config["source"]).absolute()
        plugin_config_path = plugin_path / "config.yaml"
        plugin_config_json = load_yaml(plugin_config_path)
        global_config["path"] = plugin_config_path
        plugin_config = PluginConfigSchema().load(plugin_config_json)
        name = plugin_config.get("name") or global_config.get("name")
        if not name:
            raise ValueError("no name is set for the plugin")
        plugin_config["image"] = f"{name}:latest"
        # TODO: find image location
        plugin_config["build"] = ""
        plugin_config["working_dir"] = "/app"
        plugin_config["host_volumes"] = {str(plugin_path): "/app"}
        plugin_config["named_volumes"] = {f"{name}_root": "/root"}
        plugin_config["command"] = 'bash -c "pipenv sync && pipenv run python model_setup.py && pipenv run python wsgi.py"'
        self.plugin_config = plugin_config
        self.global_config = global_config

    def named_volumes_to_config(self):
        return { volume: None for volume in self.plugin_config["named_volumes"].keys() }

    def to_yaml(self):
        plugin_config = self.plugin_config
        service_conf = CommentedMap()
        service_conf["image"] = plugin_config["image"]
        service_conf["build"] = plugin_config["build"]
        service_conf["working_dir"] = plugin_config["working_dir"]
        volumes = []
        volumes += [":".join(item) for item in plugin_config["named_volumes"].items()]
        volumes += [":".join(item) for item in plugin_config["host_volumes"].items()]
        service_conf["volumes"] = volumes
        service_conf["command"] = plugin_config["command"]
        yaml_data = CommentedMap()
        yaml_data[plugin_config["name"]] = service_conf
        return yaml_data

#     def get_env():


class SummarizerPlugin:
    def __init__(self, init_data):
        if isinstance(init_data, str):
            init_data = {"source": init_data}
        self.global_config = GlobalConfigSchema().load(init_data)
        plugin_config_path = Path(self.global_config["source"]) / "config.yaml"
        plugin_config_json = load_yaml(plugin_config_path)
        self.plugin_config = PluginConfigSchema().load(plugin_config_json)


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
    compose_data["version"] = 3
    services_data = CommentedMap()

    part_files = sorted(Path("./docker").glob("*.yaml"))
    for part_file in part_files:
        service_data = yaml.load(part_file)
        if "volumes" in service_data:
            volumes.extend(service_data.pop("volumes"))
        services_data.update(service_data)

    for plugin in metric_plugins:
        volumes.extend(plugin.named_volumes_to_config())
        services_data.update(plugin.to_yaml())

    compose_data["services"] = services_data
    compose_data["volumes"] = volumes.to_dict()

    remove_comments(compose_data)
    add_newlines(services_data)
    add_newlines(compose_data)
    yaml.dump(compose_data, Path("./docker-compose.yaml"))


@click.command()
def dev():
    gen_docker_compose()


@click.group()
def main():
    pass


main.add_command(dev)

if __name__ == "__main__":
    main()
