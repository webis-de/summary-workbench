from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields


class CalculateSchema(Schema):
    hypdata = fields.List(fields.String(), required=True)
    refdata = fields.List(fields.String(), required=True)
    metrics = fields.List(fields.String(), required=True)


class CalculateResource(Resource):
    def post(self):
        try:
            calculation_args = CalculateSchema().load(request.json)
            hypdata = calculation_args["hypdata"]
            refdata = calculation_args["refdata"]
            metrics = calculation_args["metrics"]
            scores = current_app.METRICS.compute(metrics, hypdata, refdata)
            return scores, 200
        except Exception as error:
            current_app.logger.warn(error)
            return "", 400
