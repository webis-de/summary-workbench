from inspect import Parameter, signature
from typing import Any, List, Literal, Optional

from pydantic import BaseModel, Field, create_model, validator


class IntArgument(BaseModel):
    type: Literal["int"] = Field(description="type of the argument")
    default: Optional[int] = Field(description="default argument for that field")
    display: Optional[str] = Field(
        description="text that will be shown as name in the frontend"
    )
    min: Optional[int] = Field(description="minimal value for that argument")
    max: Optional[int] = Field(description="maximal value for that argument")


class FloatArgument(BaseModel):
    type: Literal["float"] = Field(description="type of the argument")
    default: Optional[float] = Field(description="default argument for that field")
    display: Optional[str] = Field(
        description="text that will be shown as name in the frontend"
    )
    min: Optional[float] = Field(description="minimal value for that argument")
    max: Optional[float] = Field(description="maximal value for that argument")


class BoolArgument(BaseModel):
    type: Literal["bool"] = Field(description="type of the argument")
    default: Optional[bool] = Field(description="default argument for that field")
    display: Optional[str] = Field(
        description="text that will be shown as name in the frontend"
    )


class StringArgument(BaseModel):
    type: Literal["str"] = Field(description="type of the argument")
    useTextarea: bool = Field(
        False,
        description="if true, a textarea will be used for text input in the frontend instead of an normal input field",
    )
    default: Optional[str] = Field(description="default argument for that field")
    display: Optional[str] = Field(
        description="text that will be shown as name in the frontend"
    )


class CategoricalArgument(BaseModel):
    type: Literal["categorical"] = Field(description="type of the argument")
    categories: List[str] = Field(description="list of categories")
    default: Optional[str] = Field(description="default argument for that field")
    display: Optional[str] = Field(
        description="text that will be shown as name in the frontend"
    )

    @validator("default")
    def in_categories(cls, value, values):
        if value is not None and value not in values["categories"]:
            raise ValueError(f"{value} must be one of {values['categories']}")
        return value


TYPE_TO_ARGUMENT = {
    "int": IntArgument,
    "float": FloatArgument,
    "bool": BoolArgument,
    "categorical": CategoricalArgument,
    "str": StringArgument,
}


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


ARGUMENT_ERRORS = {
    Parameter.POSITIONAL_OR_KEYWORD: None,
    Parameter.KEYWORD_ONLY: None,
    Parameter.POSITIONAL_ONLY: "positional only arguments are not supported e.g. don't use /",
    Parameter.VAR_POSITIONAL: "variadic positional arguments are not supported e.g. don't use *args",
    Parameter.VAR_KEYWORD: "variadic keyword arguments are not supported e.g. don't use **kwargs",
}


class Config:
    allow_mutation = False
    extra = "forbid"


def create_function_validator(
    function, positional_arguments=None, required_arguments=None, validators=None
):
    parameters = signature(function).parameters
    extra_arguments = {}
    pos_arguments = {}
    param_iter = iter(parameters.items())
    if positional_arguments is not None:
        for name, anno in positional_arguments:
            arg_name, p = next(param_iter)
            if arg_name != name:
                raise ValueError(f"the positional parameter '{name}' is not present")
            if not p.annotation is p.empty:
                if p.annotation != anno:
                    raise ValueError(
                        f"the annotation '{p.annotation}' for '{name}' is wrong and should be {anno} or omitted"
                    )
                if p.default is not p.empty:
                    raise ValueError(
                        f"the default argument for '{name}' should not be present"
                    )
            pos_arguments[name] = (anno, ...)
    for name, p in param_iter:
        annotation = Any if p.annotation is p.empty else p.annotation
        default = ... if p.default is p.empty else p.default
        error = ARGUMENT_ERRORS[p.kind]
        if error is not None:
            raise ValueError(error)
        extra_arguments[name] = annotation, default
    if required_arguments is not None:
        for name, (annotation, default) in required_arguments.items():
            try:
                anno, defa = extra_arguments[name]
                if anno is not Any and anno != annotation:
                    raise ValueError(
                        f"the annotation '{anno}' for '{name}' is wrong and should be {annotation} or omitted"
                    )
                if defa is not ...:
                    raise ValueError(
                        f"the default argument for '{name}' should not be present"
                    )
                del extra_arguments[name]
            except KeyError:
                raise ValueError(f"'{name}' is not present")
    else:
        required_arguments = {}

    batch_validator = create_model("BatchValidator", **pos_arguments)
    required_validator = create_model("RequiredValidator", **required_arguments)
    argument_validator = create_model("ArgumentValidator", **extra_arguments)
    full_validator = create_model(
        "FullValidator",
        **pos_arguments,
        **required_arguments,
        **extra_arguments,
        __config__=Config,
        __validators__=validators,
    )
    return batch_validator, required_validator, argument_validator, full_validator
