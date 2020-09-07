from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields, validate
from app.common import Metrics


class EvaluateSchema(Schema):
    hypdata = fields.List(fields.String(), required=True)
    refdata = fields.List(fields.String(), required=True)
    metrics = fields.List(fields.String(), validate=validate.ContainsOnly(Metrics.METRICS()), required=True)


class EvaluateResource(Resource):
    def post(self):
        try:
            evaluation_args = EvaluateSchema().load(request.json)
            hypdata = evaluation_args["hypdata"]
            refdata = evaluation_args["refdata"]
            metrics = evaluation_args["metrics"]
            scores = current_app.METRICS.compute(metrics, hypdata, refdata)
            return scores, 200
        except Exception as error:
            current_app.logger.warn(error)
            return "", 400
