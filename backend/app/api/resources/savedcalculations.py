from flask import current_app, request
from flask_restful import Resource
from marshmallow import Schema, fields

class SavedCalculationResource(Resource):
    def get(self, name):
        try:
            calculation = current_app.SAVED_CALCULATIONS[name]
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
        except:
            return '', 404


class SavedCalculationsResource(Resource):
    def get(self):
        try:
            return list(current_app.SAVED_CALCULATIONS), 200
        except Exception as e:
            return '', 400

    def post(self):
        try:
            name = request.json["name"]
            current_app.SAVED_CALCULATIONS[name] = current_app.LAST_CALCULATION[1]
            current_app.LAST_CALCULATION = None
            return '', 200
        except Exception as e:
            return '', 400
