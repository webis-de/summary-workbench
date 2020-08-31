import logging

from flask import Flask, jsonify, request

from metric import Metrics

metrics = Metrics()

app = Flask(__name__)


@app.route("/", methods=["POST"])
def score_route():
    try:
        request_json = request.json

        request_metrics = request_json["metrics"]
        hyps = request_json["hyps"]
        refs = request_json["refs"]

        if isinstance(hyps, str):
            hyps = [hyps]

        if isinstance(refs, str):
            refs = [refs]

        results = metrics.compute(request_metrics, hyps, refs)

        headers = {"Content-Type": "application/json"}
        return jsonify(results), 200, headers
    except Exception as error:
        logging.warning(error)
        return "", 400


@app.route("/health")
def health():
    return "", 200
