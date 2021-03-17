#!/usr/bin/env python3
from sys import argv
from flask import Flask, jsonify, request
from newspaper import Article

app = Flask(__name__)

@app.route("/", methods=["POST"])
def score_route():
    try:
        url = request.json["url"]
        article = Article(url)
        article.download()
        article.parse()
        text = article.text
        return {"text": text}, 200, {"Content-Type": "application/json"}
    except Exception:
        return {}, 400, {"Content-Type": "application/json"}


app.run("localhost", port=argv[1], debug=False)
