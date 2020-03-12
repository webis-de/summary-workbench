from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields

from app.common.calculation import Calculation


class CalculateSchema(Schema):
    hypdata = fields.String(required=True)
    refdata = fields.String(required=True)
    metrics = fields.List(fields.String(), required=True)


class CalculateResource(Resource):
    def post(self):
        try:
            calculate_loader = CalculateSchema()
            calculationArgs = calculate_loader.load(request.json)
            hypdata = calculationArgs["hypdata"]
            refdata = calculationArgs["refdata"]
            metrics = calculationArgs["metrics"]
            hyps = hypdata.splitlines()
            refs = refdata.splitlines()
            scores = current_app.METRICS.compute(metrics, hyps, refs)
            return scores, 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400

