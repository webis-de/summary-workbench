from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields
from app.common.calculation import Calculation

from marshmallow import Schema, fields



class SavedCalculationResource(Resource):
    def get(self, name):
        try:
            calculation = current_app.SAVED_CALCULATIONS[name]
            return {
                "comparisons": calculation.comparisons,
            }, 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 404

    def delete(self, name):
        try:
            del current_app.SAVED_CALCULATIONS[name]
            return '', 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 404


class SavedCalculationSchema(Schema):
    name = fields.String(required=True)
    scores = fields.Dict(keys=fields.String(), values=fields.Dict(keys=fields.String(), values=fields.Float()), required=True)
    comparisons = fields.Raw(required=True)


class SavedCalculationsResource(Resource):
    def get(self):
        try:
            return list(current_app.SAVED_CALCULATIONS), 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400

    def post(self):
        try:
            saved_calculation_args = SavedCalculationSchema().load(request.json)
            name = saved_calculation_args["name"]
            scores = saved_calculation_args["scores"]
            comparisons = saved_calculation_args["comparisons"]
            current_app.SAVED_CALCULATIONS[name] = Calculation(
                scores=scores,
                comparisons=comparisons
            )
            return '', 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400
