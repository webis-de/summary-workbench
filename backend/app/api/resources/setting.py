from flask import current_app, request
from flask_restful import Resource
from marshmallow import Schema, fields


class SettingSchema(Schema):
    metric = fields.String()
    value = fields.Boolean()


class Setting(Resource):
    def post(self):
        try:
            setting_loader = SettingSchema()
            setting = setting_loader.load(request.json)
            metric, value = setting["metric"], setting["value"]
            current_app.SETTINGS.set_metric(metric, value)
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
