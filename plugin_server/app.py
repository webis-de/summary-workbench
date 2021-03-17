import logging
from os import environ

from flask import Flask, jsonify, request

PLUGIN_TYPE = environ.get("PLUGIN_TYPE")
PLUGIN_NAME = environ.get("PLUGIN_NAME")


def construct_metric():
    from metric import MetricPlugin

    plugin = MetricPlugin()

    def index():
        try:
            request_json = request.json

            hyps = request_json["hyps"]
            refs = request_json["refs"]

            if isinstance(hyps, str):
                hyps = [hyps]

            if isinstance(refs, str):
                refs = [refs]

            score = plugin.evaluate(hyps, refs)

            headers = {"Content-Type": "application/json"}
            return jsonify({PLUGIN_NAME: score}), 200, headers
        except Exception as error:
            logging.warning(error)
            return "", 400

    return index


def construct_summarizer():
    from summarizer import SummarizerPlugin

    plugin = SummarizerPlugin()

    def index():
        try:
            request_json = request.json

            text = request_json["text"]
            ratio = request_json["ratio"]

            summary = plugin.summarize(text, ratio)

            headers = {"Content-Type": "application/json"}
            return jsonify({PLUGIN_NAME: summary}), 200, headers
        except Exception as error:
            logging.warning(error)
            return "", 400

    return index


def health():
    return "", 200


PLUGIN_TYPES = {
    "METRIC": construct_metric,
    "SUMMARIZER": construct_summarizer,
}

if not PLUGIN_NAME:
    raise ValueError("environment variable PLUGIN_NAME needs to be defined")
if not PLUGIN_TYPE:
    raise ValueError(
        f"environment variable PLUGIN_TYPE needs to be defined (one of: {list(PLUGIN_TYPES)})"
    )

construct_method = PLUGIN_TYPES.get(PLUGIN_TYPE)
if not construct_method:
    raise ValueError(
        f"environment variable PLUGIN_TYPE needs to be one of: {list(PLUGIN_TYPES)}"
    )

index = construct_method()

app = Flask(__name__)
app.add_url_rule("/", "index", index, methods=["POST"])
app.add_url_rule("/health", "health", health)
