import logging

from flask import Flask, jsonify, request

from summarizer import BertSummarizer
import nltk

summarizer = BertSummarizer()

app = Flask(__name__)


@app.route("/", methods=["POST"])
def summarize_route():
    try:
        request_json = request.json

        text = request_json["text"]
        ratio = request_json["ratio"]

        summary = summarizer.summarize(text, ratio * 0.25)
        summary = nltk.sent_tokenize(summary)

        headers = {"Content-Type": "application/json"}
        return jsonify({"bertsum": summary}), 200, headers
    except Exception as error:
        logging.warning(error)
        return "", 400


@app.route("/health")
def health():
    return "", 200
