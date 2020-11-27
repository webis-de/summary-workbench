from app.models import Calculation
from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields, validate

class SavedCalculationResource(Resource):
    def get(self, name):
        try:
            calculation = Calculation.get(name)
            return {
                "comparisons": calculation.comparisons,
            }, 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 404

    def delete(self, name):
        try:
            Calculation.delete_entry(name)
            return '', 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 404


class SavedCalculationsSchema(Schema):
    name = fields.String(required=True, validate=validate.Regexp("^.*\S+.*$"))
    scores = fields.Dict(keys=fields.String(), values=fields.Dict(keys=fields.String(), values=fields.Float()), required=True)
    comparisons = fields.Raw(required=True)


class SavedCalculationsResource(Resource):
    def get(self):
        try:
            return Calculation.all_without_comparisons(), 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400

    def post(self):
        try:
            saved_calculation_args = SavedCalculationsSchema().load(request.json)
            name = saved_calculation_args["name"].strip()
            comparisons = saved_calculation_args["comparisons"]
            scores = saved_calculation_args["scores"]
            Calculation.insert_entry(name=name, comparisons=comparisons, scores=scores)
            return '', 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400
