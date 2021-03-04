import logging
import re

import nltk
from flask import Flask, jsonify, request

from summarizer import NEURALSUM_MODEL, NeuralSummarizer

summarizer = NeuralSummarizer(NEURALSUM_MODEL)

MODEL_STRING = re.sub("[^a-z0-9]", "", NEURALSUM_MODEL.lower())

app = Flask(__name__)


@app.route("/", methods=["POST"])
def summarize_route():
    try:
        request_json = request.json

        text = request_json["text"]
        ratio = request_json["ratio"]

        summary = summarizer.summarize(text, ratio)
        summary = nltk.sent_tokenize(summary)

        headers = {"Content-Type": "application/json"}
        return jsonify({MODEL_STRING: summary}), 200, headers
    except Exception as error:
        logging.warning(error)
        return "", 400


@app.route("/health")
def health():
    return "", 200
