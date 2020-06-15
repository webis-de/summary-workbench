from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields, validate
from newspaper import Article
from app.common.summarizer import Summarizers


class SummarizeScheme(Schema):
    text = fields.String(required=True)
    kind = fields.String(validate=validate.OneOf({"raw", "url"}))
    summarizer = fields.String(
        validate=validate.OneOf(Summarizers.SUMMARIZERS.keys()), required=True
    )


class SummarizeResource(Resource):
    def post(self):
        try:
            generate_args = SummarizeScheme().load(request.json)
            text = generate_args["text"]
            summarizer = generate_args["summarizer"]
            kind = generate_args.get("kind", "raw")
            if kind == "url":
                article = Article(text)
                article.download()
                article.parse()
                text = article.text
            return {"summary": current_app.SUMMARIZERS.summarize(summarizer, text), "original_text": text}, 200
        except Exception as error:
            current_app.logger.warn(error)
            return "", 400
