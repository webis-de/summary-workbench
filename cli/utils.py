from hashlib import sha256
from pathlib import Path

from .config import CONFIG_PATH
import marshmallow
import ruamel
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedBase
from termcolor import colored
from sys import exit


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
    with open("./templates/Dockerfile.base") as file:
        return file.read().strip()


def load_yaml(path, json=False, multiple=False):
    path = Path(path)
    typ = "safe" if json else None
    yaml = YAML(typ=typ)
    try:
        if multiple:
            return list(yaml.load_all(path))
        return yaml.load(path)
    except FileNotFoundError:
        abort("file does not exit", path)
    except ruamel.yaml.scanner.ScannerError:
        abort("file is not a valid yaml", path)


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


def get_config():
    if not hasattr(get_config, "config"):
        get_config.config = load_yaml(CONFIG_PATH["path"], json=True)
    return get_config.config


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


def check_attr(obj, attr, message, source=None):
    if not getattr(obj, attr):
        abort(message, source)
