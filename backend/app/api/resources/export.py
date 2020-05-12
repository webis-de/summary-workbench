from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields, validate


class ExportSchema(Schema):
    scores = fields.Dict(keys=fields.String(), values=fields.Dict(keys=fields.String(), values=fields.Float()), required=True)
    format = fields.String(validate=validate.OneOf({"csv", "latex"}), required=True)
    precision = fields.Int(default=3, valdiate=validate.Range(min=0))
    transpose = fields.Bool(default=False)


from app.common.export import export_scores



class ExportResource(Resource):
    def post(self):
        try:
            export_args = ExportSchema().load(request.json)
            scores = export_args["scores"]
            format_ = export_args["format"]
            precision = export_args["precision"]
            tranpose = export_args["transpose"]
            text = export_scores(scores,
                                 format_,
                                 precision=precision,
                                 transpose=tranpose)
            return {"text": text}, 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400
