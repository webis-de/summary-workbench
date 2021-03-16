import logging
import multiprocessing

import numpy as np
from flask import Flask, jsonify, request

from moverscore import MoverScoreV2

multiprocessing.set_start_method("spawn")


scorer = MoverScoreV2()

app = Flask(__name__)


@app.route("/", methods=["POST"])
def score_route():
    try:
        request_json = request.json

        hyps = request_json["hyps"]
        refs = request_json["refs"]

        if isinstance(hyps, str):
            hyps = [hyps]

        if isinstance(refs, str):
            refs = [refs]

        score = float(np.average(scorer.score(refs, hyps)))

        headers = {"Content-Type": "application/json"}
        return jsonify({"moverscore": {"moverscore": score}}), 200, headers
    except Exception as error:
        logging.warning(error)
        return "", 400


@app.route("/health")
def health():
    return "", 200
