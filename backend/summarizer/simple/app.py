import logging

from flask import Flask, jsonify, request

from summarizer import Summarizers

summarizers = Summarizers()

app = Flask(__name__)


@app.route("/", methods=["POST"])
def summarize_route():
    try:
        request_json = request.json

        request_summarizers = request_json["summarizers"]
        text = request_json["text"]
        ratio = request_json["ratio"]

        summaries = summarizers.summarize(request_summarizers, text, ratio)

        headers = {"Content-Type": "application/json"}
        return jsonify(summaries), 200, headers
    except Exception as error:
        logging.warning(error)
        return "", 400


@app.route("/health")
def health():
    return "", 200
