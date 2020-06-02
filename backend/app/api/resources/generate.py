from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields

from app.common.textsum import TextRank


class GenerateScheme(Schema):
    text = fields.String(required=True)


class GenerateResource(Resource):
    def post(self):
        try:
            generate_args = GenerateScheme().load(request.json)
            text = generate_args["text"]
            return {"text": current_app.TEXTRANK_SUM.summarize(text)}, 200
        except Exception as error:
            current_app.logger.warn(error)
            return "", 400
