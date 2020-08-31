import logging

from flask import Flask, jsonify, request

from metric import METEORScorer

scorer = METEORScorer()

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

        score = scorer.score(hyps, refs)

        headers = {"Content-Type": "application/json"}
        return jsonify({"meteor": score}), 200, headers
    except Exception as error:
        logging.warning(error)
        return "", 400


@app.route("/health")
def health():
    return "", 200
