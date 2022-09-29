import copy
import json
import sys
import uuid
from os import environ
from typing import Literal, Union, Tuple, List

import uvicorn
from application import build_application
from argument_models import create_function_validator, parse_arguments
from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from models import MetricBase, SummarizerBase
from pydantic import BaseModel, Field, create_model, root_validator, validator

sys.path.insert(0, "/summary_workbench_plugin_files")

PLUGIN_CONFIG = json.loads(environ.get("PLUGIN_CONFIG"))
PLUGIN_CONFIG["instancetag"] = str(uuid.uuid4())
PLUGIN_TYPE = PLUGIN_CONFIG["type"]


PARSED_ARGUMENTS = parse_arguments(PLUGIN_CONFIG["arguments"])


def to_float_list(array):
    return [float(e) for e in array]


def get_config(plugin):
    updated_plugin_config = copy.deepcopy(PLUGIN_CONFIG)
    updated_plugin_config.setdefault("metadata", {})
    try:
        updated_plugin_config["metadata"].update(plugin.metadata())
    except AttributeError:
        pass
    return updated_plugin_config


def construct_metric():
    from metric import MetricPlugin

    def same_number_lines(_, values):
        batch = values["batch"]
        for i, (hypotheses, references) in enumerate(batch):
            len_hyp = len(hypotheses)
            len_ref =  len(references)
            if len_hyp != len_ref:
                raise ValueError(f"hypotheses and references of element {i} of the batch do not have the same length ({len_hyp} != {len_ref})")
        return values

    plugin = MetricPlugin()
    updated_plugin_config = get_config(plugin)

    bv, rv, av, fv = create_function_validator(
        plugin.evaluate,
        [("batch", Tuple[List[str], List[str]])],
        {
            "ratio": (
                float,
                Field(
                    0.2,
                    gt=0,
                    lt=1,
                    description="The ratio must be in the closed interval (0,1)",
                ),
            )
        },
        validators={"batch_validator": root_validator()(same_number_lines)}
    )

    app = build_application(
        plugin.summarize,
        fv,
        num_threads=1,
        batch_size=32
    )

    @app.get("/config")
    async def config():
        return updated_plugin_config

    return app


from typing import List


def construct_summarizer():
    from summarizer import SummarizerPlugin

    plugin = SummarizerPlugin()
    updated_plugin_config = get_config(plugin)
    bv, rv, av, fv = create_function_validator(
        plugin.summarize,
        [("batch", List[str])],
        {
            "ratio": (
                float,
                Field(
                    0.2,
                    gt=0,
                    lt=1,
                    description="The ratio must be in the closed interval (0,1)",
                ),
            )
        },
    )
    app = build_application(
        plugin.summarize,
        fv,
        num_threads=1,
        batch_size=32
    )

    @app.get("/config")
    async def config():
        return updated_plugin_config

    return app


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

app = PLUGIN_TYPES.get(PLUGIN_TYPE)()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
