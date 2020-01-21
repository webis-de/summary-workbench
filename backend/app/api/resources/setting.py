from flask import current_app, request
from flask_restful import Resource
from marshmallow import Schema, fields


class SettingSchema(Schema):
    metric = fields.String()
    is_set = fields.Boolean()


class SettingResource(Resource):
    def get(self):
        try:
            return current_app.SETTINGS.todict(), 200
        except:
            return '', 400

    def patch(self):
        try:
            setting_loader = SettingSchema()
            setting = setting_loader.load(request.json)
            metric, is_set = setting["metric"], setting["is_set"]
            current_app.SETTINGS.set_metric(metric, is_set)
            return '', 200
        except Exception as e:
            return '', 400

    def delete(self):
        try:
            current_app.HYP_DOCS.clear()
            current_app.REF_DOCS.clear()
            return '', 200
        except:
            return '', 400
