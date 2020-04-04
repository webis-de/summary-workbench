from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields


class SecondSchema(Schema):
    hypdata = fields.String(required=True)
    refdata = fields.String(required=True)
    metrics = fields.List(fields.String(), required=True)


class SecondResource(Resource):
    def post(self):
        try:
            calculate_loader = SecondSchema()
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
