from pathlib import Path
from typing import Dict, List, Optional, Union

# from plugin_server
from pydantic import BaseModel, Field, HttpUrl, ValidationError, constr

from .exceptions import ModelValidationError

key_pattern = "^[_a-zA-Z]+$"
variable_pattern = "^[_a-zA-Z]+[_a-zA-Z0-9]*$"
name_pattern = "^[- _a-zA-Z0-9{}()]+$"


class ThrowMixin:
    @classmethod
    def load(cls, __origin, *args, **kwargs):
        try:
            return cls(*args, **kwargs)
        except ValidationError as error:
            raise ModelValidationError(error.errors(), __origin)


class PluginModel(BaseModel, ThrowMixin):
    version: str = Field(
        description="version of the plugin (e.g. 1.0), which will be used to tag the image"
    )
    name: str = Field(
        regex=name_pattern, description="name of the plugin (e.g. BERT-model)"
    )
    metadata: Dict[constr(regex=key_pattern), str] = Field(
        {},
        description="extra information that will be provided to the image as environment variables and also to the user using that plugin (e.g. author name, source code, paper url)",
    )

    class Config:
        allow_mutation = False
        extra = "forbid"


plugin_source_type = Union[HttpUrl, Path]


class ConfigurePluginModel(BaseModel):
    source: plugin_source_type = Field(
        description="path to the plugin or url to a git repository for that plugin"
    )
    disabled: bool = Field(
        False,
        description="if the plugin is disabled it will be shown in the selection but will not be loaded in the backend",
    )
    image_url: Optional[str] = Field(
        description="dockerhub source of an already build image (allows you to skip the build phase)"
    )
    environment: Dict[constr(regex=key_pattern), Union[str, int, float, bool]] = Field(
        {},
        description="key value pairs that will be environment variables inside of the image, can also be used to generate names of the plugin dynamically",
    )
    extern_environment: Dict[
        constr(regex=key_pattern), Union[str, int, float, bool]
    ] = Field(
        {},
        description="key value pairs that will be environment variables inside of all the plugins (not during build time, but also in kubernetes files)",
    )

    class Config:
        allow_mutation = False
        extra = "forbid"


class DeployModel(BaseModel):
    host: str = Field(
        description="host name where the application is exposed on the kubernetes cluster",
    )
    resources: Dict = Field({}, description="requests and limits for all pods")

    class Config:
        allow_mutation = False
        extra = "forbid"


plugin_type = List[Union[ConfigurePluginModel, plugin_source_type]]


class ConfigModel(BaseModel, ThrowMixin):
    docker_username: Optional[str] = Field(
        description="the docker username of the dockerhub account where the build images are pushed to and which are used as source for the kubernetes images"
    )
    deploy: Optional[DeployModel] = Field(
        description="configuration for the kubernetes deployment"
    )
    extern_environment: Dict[
        constr(regex=key_pattern), Union[str, int, float, bool]
    ] = Field(
        {},
        description="key value pairs that will be environment variables inside of all the plugins (not during build time, but also in kubernetes files)",
    )
    metrics: plugin_type = Field([], description="configuration for metrics")
    summarizers: plugin_type = Field([], description="configuration for summarizers")

    class Config:
        allow_mutation = False
        extra = "forbid"
