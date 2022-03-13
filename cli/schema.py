from pathlib import Path
from typing import Dict, List, Optional, Union

from pydantic import BaseModel, HttpUrl, ValidationError, constr

from .exceptions import ModelValidationError

key_pattern = "^[_a-zA-Z]+$"
name_pattern = "^[ _a-zA-Z0-9{}]+$"


class ThrowMixin:
    @classmethod
    def load(cls, __origin, *args, **kwargs):
        try:
            return cls(*args, **kwargs)
        except ValidationError as error:
            raise ModelValidationError(error.errors(), __origin)


class PluginModel(BaseModel, ThrowMixin):
    version: str
    name: constr(regex=name_pattern)
    metadata: Dict[constr(regex=key_pattern), str] = {}

    class Config:
        allow_mutation = False
        extra = "forbid"


plugin_source_type = Union[HttpUrl, Path]


class ConfigurePluginModel(BaseModel):
    source: plugin_source_type
    image_url: Optional[str]
    environment: Dict[constr(regex=key_pattern), str] = {}

    class Config:
        allow_mutation = False
        extra = "forbid"


class DeployModel(BaseModel):
    host: str

    class Config:
        allow_mutation = False
        extra = "forbid"


plugin_type = List[Union[ConfigurePluginModel, plugin_source_type]]


class ConfigModel(BaseModel, ThrowMixin):
    docker_username: Optional[str]
    deploy: Optional[DeployModel]
    metrics: plugin_type = []
    summarizers: plugin_type = []

    class Config:
        allow_mutation = False
        extra = "forbid"
