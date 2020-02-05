from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields


class HypSchema(Schema):
    filename = fields.String()
    filecontent = fields.String()


class HypResource(Resource):
    def get(self):
        try:
            hyps = current_app.HYP_DOCS.choices()
            return hyps, 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400

    def post(self):
        try:
            hyp_loader = HypSchema()
            hyp = hyp_loader.load(request.json)
            filename, filecontent = hyp["filename"], hyp["filecontent"]
            current_app.HYP_DOCS[filename] = filecontent.splitlines()
            return '', 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400

    def delete(self):
        try:
            current_app.HYP_DOCS.clear()
            return '', 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400
