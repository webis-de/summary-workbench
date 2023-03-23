import json
import sys
import uuid
from os import environ

import uvicorn
from application import build_application

sys.path.insert(0, "/summary_workbench_plugin_files")

PLUGIN_CONFIG = json.loads(environ["PLUGIN_CONFIG"])
NUM_THREADS = int(environ.get("THREADS", 1))
BATCH_SIZE = int(environ.get("BATCH_SIZE", 8))
CACHE_SIZE = int(environ.get("CACHE_SIZE", 0))


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

plugin_config = PLUGIN_CONFIG
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
    factory.func,
    factory.full_validator,
    num_threads=NUM_THREADS,
    batch_size=BATCH_SIZE,
    cache_size=CACHE_SIZE,
)


@app.get("/config")
async def config():
    return {**plugin_config, "statistics": await app.statistics()}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
