import json
import sys
from os import environ
from typing import List, Literal, Optional, Union

import uvicorn
from fastapi import FastAPI, Response
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field, create_model, root_validator, validator

sys.path.insert(0, "/tldr_plugin_files")

PLUGIN_CONFIG = json.loads(environ.get("PLUGIN_CONFIG"))
PLUGIN_TYPE = PLUGIN_CONFIG["type"]

app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc):
    return Response(exc.json(), status_code=400)


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


TYPE_TO_ARGUMENT = {
    "int": IntArgument,
    "float": IntArgument,
    "bool": BoolArgument,
    "categorical": CategoricalArgument,
    "str": StringArgument,
}


def build_min_validator(min_value):
    def min_validator(_, v):
        if v < min_value:
            raise ValueError(f"{v} is smaller than {min_value}")
        return v

    return min_validator


def build_max_validator(max_value):
    def max_validator(_, v):
        if v > max_value:
            raise ValueError(f"{v} is bigger than {max_value}")
        return v

    return max_validator


def parse_arguments(arguments):
    kwargs = {}
    for varname, argument in arguments.items():
        parsed = []
        argument = TYPE_TO_ARGUMENT[argument["type"]](**argument)
        if argument.type == "int":
            parsed.append(int)
        elif argument.type == "float":
            parsed.append(float)
        elif argument.type == "bool":
            parsed.append(bool)
        elif argument.type == "str":
            parsed.append(str)
        elif argument.type == "categorical":
            parsed.append(Literal[tuple(argument.categories)])
        else:
            raise ValueError(f"unknown type {argument.type}")

        field_args = {}
        if hasattr(argument, "min") and argument.min is not None:
            field_args["ge"] = argument.min
        if hasattr(argument, "max") and argument.min is not None:
            field_args["le"] = argument.max

        if argument.default is not None:
            parsed.append(Field(argument.default, **field_args))
        else:
            parsed.append(Field(**field_args))

        kwargs[varname] = tuple(parsed)

    return kwargs


PARSED_ARGUMENTS = parse_arguments(PLUGIN_CONFIG["arguments"])


def to_list(value):
    if isinstance(value, str):
        return [value]
    return value


class MetricBase(BaseModel):
    hypotheses: Union[str, list]
    references: Union[str, list]

    hypotheses_validator = validator("hypotheses", allow_reuse=True)(to_list)
    references_validator = validator("references", allow_reuse=True)(to_list)

    @root_validator()
    def same_number_lines(_, values):
        if len(values["hypotheses"]) != len(values["references"]):
            raise ValueError("hypotheses and references have to have the same length")
        return values


class SummarizerBase(BaseModel):
    text: str
    ratio: float = Field(
        ..., gt=0, lt=1, description="The ratio must be in the closed interval (0,1)"
    )


def construct_metric():
    from metric import MetricPlugin

    MetricBody = create_model("MetricBody", **PARSED_ARGUMENTS, __base__=MetricBase)

    plugin = MetricPlugin()

    @app.post("/")
    def evaluate(body: MetricBody, response: Response):
        try:
            return {"score": plugin.evaluate(**body.dict())}
        except Exception as error:
            response.status_code = 400
            return {"message": ", ".join(error.args)}

    @app.post("/validate")
    def validate(_: MetricBody):
        pass


def construct_summarizer():
    from summarizer import SummarizerPlugin

    SummarizerBody = create_model(
        "SummarizerBody", **PARSED_ARGUMENTS, __base__=SummarizerBase
    )

    plugin = SummarizerPlugin()

    @app.post("/")
    def summarize(body: SummarizerBody, response: Response):
        try:
            return {"summary": plugin.summarize(**body.dict())}
        except Exception as error:
            response.status_code = 400
            return {"message": ", ".join(error.args)}

    @app.post("/validate")
    def validate(_: SummarizerBody):
        pass


PLUGIN_TYPES = {
    "metric": construct_metric,
    "summarizer": construct_summarizer,
}

if not PLUGIN_TYPE:
    raise ValueError(
        f"environment variable PLUGIN_TYPE needs to be defined (one of: {list(PLUGIN_TYPES)})"
    )

if PLUGIN_TYPE not in PLUGIN_TYPES:
    raise ValueError(
        f"environment variable PLUGIN_TYPE needs to be one of: {list(PLUGIN_TYPES)}"
    )

PLUGIN_TYPES.get(PLUGIN_TYPE)()


@app.get("/config")
async def config():
    return PLUGIN_CONFIG


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
