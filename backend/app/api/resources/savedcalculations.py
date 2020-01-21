from flask import current_app, request
from flask_restful import Resource
from marshmallow import Schema, fields


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
