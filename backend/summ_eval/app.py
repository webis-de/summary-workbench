import logging

from flask import Flask, jsonify, request, current_app
import multiprocessing
multiprocessing.set_start_method("spawn")

from summ_eval import compute

app = Flask(__name__)

@app.route("/", methods=["POST"])
def score_route():
    try:
        request_json = request.json

        metrics = request_json["metrics"]
        hyps = request_json["hyps"]
        refs = request_json["refs"]

        if isinstance(hyps, str):
            hyps = [hyps]

        if isinstance(refs, str):
            refs = [refs]

        scores = compute(metrics, hyps, refs)

        headers = {"Content-Type": "application/json"}
        return jsonify(scores), 200, headers
    except Exception as error:
        logging.warning(error)
        return "", 400


@app.route("/health")
def health():
    return "", 200
