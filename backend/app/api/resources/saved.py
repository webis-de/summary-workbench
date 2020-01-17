from flask import current_app, request
from flask_restful import Resource
from marshmallow import Schema, fields


class SavedSchema(Schema):
    id = fields.String()


class Saved(Resource):
    def get(self):
        try:
            saved_loader = SavedSchema()
            info = saved_loader.load(request.json)
            id = info["id"]
            calculation = current_app.SAVED_CALCULATIONS.get(id)
            hyps, refs = calculation.hyps, calculation.refs
            return {"hyps": hyps, "refs": refs}, 200
        except Exception as e:
            return '', 400
