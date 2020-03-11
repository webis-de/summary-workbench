from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields

from app.common.calculation import Calculation


class LastCalculationSchema(Schema):
    hypname = fields.String(required=True)
    refname = fields.String(required=True)
    metrics = fields.List(fields.String(), required=True)


class LastCalculationResource(Resource):
    def get(self):
        try:
            name, calculation = current_app.LAST_CALCULATION
            try:
                start = int(request.args["start"])
                end = int(request.args["end"])
                assert start >= 0
                assert end >= 0
                return {
                    "hyps": calculation.hyps[start:end],
                    "refs": calculation.refs[start:end],
                }, 200
            except:
                return {
                    "name": name,
                    "scores": calculation.scores,
                }, 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 404

    def put(self):
        try:
            calculation_loader = LastCalculationSchema()
            calculationArgs = calculation_loader.load(request.json)
            hypname = calculationArgs["hypname"]
            refname = calculationArgs["refname"]
            metrics = calculationArgs["metrics"]
            hyps = current_app.HYP_DOCS[hypname]
            refs = current_app.REF_DOCS[refname]
            scores = current_app.METRICS.compute(metrics, hyps, refs)
            current_app.LAST_CALCULATION = (
                hypname+"-"+refname,
                Calculation(hyps, refs, scores),
            )
            return '', 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400

