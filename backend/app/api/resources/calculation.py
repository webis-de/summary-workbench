from flask import current_app, request
from flask_restful import Resource
from marshmallow import Schema, fields

from common.calculation import Calculation


class CalculationSchema(Schema):
    hypname = fields.String()
    refname = fields.String()


class CalculationRes(Resource):
    def get(self):
        try:
            calculation = current_app.LAST_CALCULATION
            hypname = calculation.hypname
            refname = calculation.refname
            scores = calculation.scores
            return {
                "hypname": hypname,
                "refname": refname,
                "scores": scores
            }, 200
        except:
            return '', 400

    def post(self):
        try:
            calculation_loader = CalculationSchema()
            file_names = calculation_loader.load(request.json)
            hypname, refname = file_names["hypname"], file_names["refname"]
            hyps = current_app.HYP_DOCS[hypname]
            refs = current_app.REF_DOCS[refname]
            scores = current_app.METRICS.compute()
            current_app.LAST_CALCULATION = Calculation(hyps, refs, scores)
            return {
                "hypname": hypname,
                "refname": refname,
                "scores": scores
            }, 200
        except:
            return '', 400

    def put(self):
        try:
            name = request.json["name"]
            calculation = current_app.LAST_CALCULATION
            current_app.SAVED_CALCULATIONS.append(name, calculation)
            current_app.LAST_CALCULATION = None
            return '', 200
        except:
            return '', 400
