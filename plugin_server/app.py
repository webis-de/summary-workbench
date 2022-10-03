import json
import sys
import uuid
from os import environ

import uvicorn
from application import build_application

sys.path.insert(0, "/summary_workbench_plugin_files")


def construct_metric():
    from metric_factory import MetricFactory

    return MetricFactory()


def construct_summarizer():
    from summarizer_factory import SummarizerFactory

    return SummarizerFactory()


PLUGIN_TYPES = {
    "metric": construct_metric,
    "summarizer": construct_summarizer,
}

plugin_config = json.loads(environ.get("PLUGIN_CONFIG"))
plugin_config["instancetag"] = str(uuid.uuid4())

factory = PLUGIN_TYPES[plugin_config["type"]]()

plugin_config.setdefault("metadata", {})
plugin_config["metadata"].update(factory.metadata)
plugin_config["validators"] = {
    "batch": factory.batch_validator.schema(),
    "required": factory.required_validator.schema(),
    "argument": factory.argument_validator.schema(),
    "full": factory.full_validator.schema(),
}


app = build_application(
    factory.func, factory.full_validator, num_threads=1, batch_size=32
)


@app.get("/config")
async def config():
    return plugin_config


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
