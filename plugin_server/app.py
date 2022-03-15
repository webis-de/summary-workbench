import json
import sys
from os import environ
from typing import Union

import uvicorn
from fastapi import FastAPI, Response
from pydantic import BaseModel, Field

sys.path.insert(0, "/tldr_plugin_files")

PLUGIN_CONFIG = json.loads(environ.get("PLUGIN_CONFIG"))
PLUGIN_TYPE = PLUGIN_CONFIG["type"]

app = FastAPI()


class MetricBody(BaseModel):
    hypotheses: Union[str, list]
    references: Union[str, list]


class SummarizerBody(BaseModel):
    text: str
    ratio: float = Field(
        ..., gt=0, lt=1, description="The ratio must be in the closed interval (0,1)"
    )


def construct_metric():
    from metric import MetricPlugin

    plugin = MetricPlugin()

    @app.post("/")
    def index(body: MetricBody, response: Response):
        try:
            hypotheses = body.hypotheses
            references = body.references

            if isinstance(hypotheses, str):
                hypotheses = [hypotheses]

            if isinstance(references, str):
                references = [references]

            score = plugin.evaluate(hypotheses, references)

            return {"score": score}
        except Exception as error:
            response.status_code = 400
            return {"message": error.message}


def construct_summarizer():
    from summarizer import SummarizerPlugin

    plugin = SummarizerPlugin()

    @app.post("/")
    def index(body: SummarizerBody, response: Response):
        try:
            text = body.text
            ratio = body.ratio

            summary = plugin.summarize(text, ratio)

            return {"summary": summary}
        except Exception as error:
            response.status_code = 400
            return {"message": error.message}


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
