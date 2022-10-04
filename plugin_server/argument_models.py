from inspect import Parameter, signature
from typing import Any

from pydantic import create_model

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

    for name, (annotation, _) in extra_arguments.items():
        if annotation is Any:
            raise ValueError(f"type annotation for argument '{name}' is missing")

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
