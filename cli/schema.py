from pathlib import Path
from typing import Dict, List, Literal, Optional, Union

from pydantic import BaseModel, HttpUrl, ValidationError, constr

from .config import DEPLOY_IMAGES, DEV_IMAGES
from .exceptions import ModelValidationError

key_pattern = "^[_A-Za-z]+$"


class ThrowMixin:
    @classmethod
    def load(cls, __origin, *args, **kwargs):
        try:
            return cls(*args, **kwargs)
        except ValidationError as error:
            raise ModelValidationError(error.errors(), __origin)


class PluginModel(BaseModel, ThrowMixin):
    version: str
    name: str
    devimage: Literal[tuple(DEV_IMAGES)]  # TODO: only one devimage
    deployimage: Literal[tuple(DEPLOY_IMAGES)]  # TODO: only one devimage
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
