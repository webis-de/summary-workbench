import base64
import configparser
import json
import secrets
from collections import OrderedDict
from hashlib import sha256
from pathlib import Path

from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedBase, CommentedMap
from ruamel.yaml.parser import ParserError
from ruamel.yaml.scanner import ScannerError
from ruamel.yaml.scalarstring import PreservedScalarString

from .config import CONFIG_PATH
from .exceptions import InvalidPathError, InvalidYamlError
from .schema import ConfigModel

def _yaml_remove_comments(data):
    values = data.values() if hasattr(data, "values") else data
    for value in values:
        comments = data.ca.items
        for key in list(comments.keys()):
            del comments[key]
        if isinstance(value, CommentedBase):
            _yaml_remove_comments(value)


dict_types = [dict, CommentedMap, OrderedDict]


def _yaml_add_newlines(data):
    for key in list(data.keys())[1:]:
        data.yaml_set_comment_before_after_key(key, before="\n")


def _yaml_clean(yaml, space_keys=None):
    _yaml_remove_comments(yaml)
    _yaml_add_newlines(yaml)
    if space_keys is not None:
        for key in space_keys:
            yaml[key] = CommentedMap(yaml[key])
            _yaml_add_newlines(yaml[key])


list_types = {list, dict, CommentedMap}


def _yaml_merge(yaml, data):
    for key, value in data.items():
        if (
            type(value) not in list_types
            or type(yaml[key]) not in list_types
            or key not in yaml
        ):
            yaml[key] = value
        else:
            _yaml_merge(yaml[key], value)


def gen_hash(text):
    hasher = sha256()
    hasher.update(text.encode("utf-8"))
    return hasher.digest().hex()


class Yaml:
    PreservedString = PreservedScalarString

    def __init__(self, yaml_obj):
        if not isinstance(yaml_obj, list):
            yaml_obj = [yaml_obj]
        yaml_obj = [CommentedMap(y) for y in yaml_obj]
        self.yaml = yaml_obj
        self.yaml_writer = YAML()
        self.yaml_writer.width = 4096
        self.yaml_writer.default_flow_style = False
        self.yaml_writer.indent(mapping=2, offset=2, sequence=4)

    def extend(self, data):
        if len(self.yaml) == 1:
            _yaml_merge(self.yaml[0], data)
        else:
            for i, extend_data in data.items():
                _yaml_merge(self.yaml[i], extend_data)

    @classmethod
    def load(cls, path, json=False):
        path = Path(path)
        typ = "safe" if json else None
        yaml_loader = YAML(typ=typ)
        try:
            yaml = list(yaml_loader.load_all(path))
            if json:
                try:
                    (yaml,) = yaml
                except ValueError:
                    pass
                return yaml
            return cls(yaml)
        except FileNotFoundError:
            raise InvalidPathError(
                "file does not exit (maybe the plugin name is wrong)", path
            )
        except (ScannerError, ParserError):
            raise InvalidYamlError("file is not a valid yaml", path)

    def dump(self, path, space_keys=None):
        if isinstance(self.yaml, list):
            for y in self.yaml:
                _yaml_clean(y, space_keys=space_keys)
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        self.yaml_writer.dump_all(self.yaml, path)


def get_config():
    if not hasattr(get_config, "config"):
        path = CONFIG_PATH["path"]
        conf = Yaml.load(path, json=True)
        get_config.config = ConfigModel.load(path, **conf)
    return get_config.config


def dict_path(path, value):
    d = value
    for key in reversed(path):
        d = {key: d}
    return d


class InvalidFileError(Exception):
    pass


def python_version_from_pipfile(root_path):
    try:
        pipfilelock = root_path / "Pipfile.lock"
        with open(pipfilelock, "r") as file:
            return json.load(file)["_meta"]["requires"]["python_version"]
    except (json.JSONDecodeError, FileNotFoundError):
        raise InvalidFileError()
    except KeyError:
        return None


def python_version_from_pipfile_lock(root_path):
    try:
        pipfile = root_path / "Pipfile"
        config_parser = configparser.ConfigParser()
        config_parser.read(pipfile)
        version = config_parser["requires"]["python_version"]
        if version is not None:
            version = version.strip('"').strip("'")
        return version
    except FileNotFoundError:
        raise InvalidFileError()
    except KeyError:
        return None


def python_version_from_path(root_path):
    for func in [python_version_from_pipfile_lock, python_version_from_pipfile]:
        try:
            version = func(root_path)
            if version is not None:
                return {"python_version": version}
            return None
        except InvalidFileError:
            pass
    return None


def gen_secret(nbytes):
    return base64.b64encode(secrets.token_bytes(nbytes)).decode("ascii")
