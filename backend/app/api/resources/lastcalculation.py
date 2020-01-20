from flask import current_app, request
from flask_restful import Resource
from marshmallow import Schema, fields

from app.common.calculation import Calculation


class LastCalculationSchema(Schema):
    hypname = fields.String()
    refname = fields.String()


class LastCalculation(Resource):
    def get(self):
        try:
            name, calculation = current_app.LAST_CALCULATION
            type = request.args["type"]
            if type == "scores":
                return {
                    "name": name,
                    "scores": calculation.scores,
                }, 200
            elif type == "hyps_refs":
                return {
                    "hyps": calculation.hyps,
                    "refs": calculation.refs,
                }, 200
            else:
                return '', 400
        except:
            return '', 400

    def put(self):
        try:
            calculation_loader = LastCalculationSchema()
            file_names = calculation_loader.load(request.json)
            hypname, refname = file_names["hypname"], file_names["refname"]
            hyps = current_app.HYP_DOCS[hypname]
            refs = current_app.REF_DOCS[refname]
            scores = current_app.METRICS.compute(
                current_app.SETTINGS.chosen_metrics(),
                hyps,
                refs
            )
            current_app.LAST_CALCULATION = (
                hypname+"-"+refname,
                Calculation(hyps, refs, scores),
            )
            return '', 200
        except Exception as e:
            current_app.logger.info(e)
            return '', 400

