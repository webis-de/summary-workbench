from pathlib import Path
from typing import Dict, List, Literal, Optional, Union

from pydantic import (BaseModel, Field, HttpUrl, ValidationError, constr,
                      validator)

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


class IntArgument(BaseModel):
    type: Literal["int"] = Field(description="type of the argument")
    default: Optional[int] = Field(description="default argument for that field")
    min: Optional[int] = Field(description="minimal value for that argument")
    max: Optional[int] = Field(description="maximal vlaue for that argument")


class FloatArgument(BaseModel):
    type: Literal["float"] = Field(description="type of the argument")
    default: Optional[float] = Field(description="default argument for that field")
    min: Optional[float] = Field(description="minimal value for that argument")
    max: Optional[float] = Field(description="maximal vlaue for that argument")


class BoolArgument(BaseModel):
    type: Literal["bool"] = Field(description="type of the argument")
    default: Optional[bool] = Field(description="default argument for that field")


class StringArgument(BaseModel):
    type: Literal["str"] = Field(description="type of the argument")
    default: Optional[str] = Field(description="default argument for that field")


class CategoricalArgument(BaseModel):
    type: Literal["categorical"] = Field(description="type of the argument")
    categories: List[str] = Field(description="list of categories")
    default: Optional[str] = Field(description="default argument for that field")

    @validator("default")
    def in_categories(cls, value, values):
        if value is not None and value not in values["categories"]:
            raise ValueError(f"{value} must be one of {values['categories']}")
        return value


class PluginModel(BaseModel, ThrowMixin):
    version: str = Field(
        description="version of the plugin (e.g. 1.0), which will be used to tag the image"
    )
    name: str = Field(
        regex=name_pattern, description="name of the plugin (e.g. BERT-model)"
    )
    arguments: Dict[
        constr(regex=variable_pattern),
        Union[
            IntArgument,
            FloatArgument,
            BoolArgument,
            StringArgument,
            CategoricalArgument,
        ],
    ] = Field(
        {},
        description="Defines extra arguments for your plugin, which will be passed to your summarizer/metric as keyword arguments. For number types min and max value can be provided. If the type of the plugin is 'categorical' the default argument is required and has to be a list of strings.",
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

    class Config:
        allow_mutation = False
        extra = "forbid"


class DeployModel(BaseModel):
    host: str = Field(
        description="host name where the application is exposed on the kubernetes cluster",
    )

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
    metrics: plugin_type = Field([], description="configuration for metrics")
    summarizers: plugin_type = Field([], description="configuration for summarizers")

    class Config:
        allow_mutation = False
        extra = "forbid"
