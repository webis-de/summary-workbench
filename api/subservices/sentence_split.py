#!/usr/bin/env python3
from sys import argv, version, stderr
import nltk
from flask import Flask, request
stderr.write(str(version))

app = Flask(__name__)

nltk.download("punkt")

@app.route("/", methods=["POST"])
def score_route():
    try:
        text = request.json["text"]
        sentences = nltk.sent_tokenize(text)
        return {"sentences": sentences}, 200, {"Content-Type": "application/json"}
    except Exception as e:
        print(e)
        return {}, 400, {"Content-Type": "application/json"}

app.run("localhost", port=argv[1], debug=False)
