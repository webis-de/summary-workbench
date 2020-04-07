from flask import current_app, request
from flask_restx import Resource

from app.common.export import export_scores


class ExportResource(Resource):
    def post(self):
        try:
            scores = request.json["scores"]
            export_format = request.json["format"]
            precision = request.json.get("precision", 4)
            tranpose = request.json.get("transpose", False)
            text = export_scores(scores,
                                 export_format,
                                 precision=precision,
                                 transpose=tranpose)
            return {"text": text}, 200
        except Exception as e:
            current_app.logger.warn(e)
            return '', 400
