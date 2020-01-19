from flask import current_app, request
from flask_restful import Resource
from marshmallow import Schema, fields


class RefSchema(Schema):
    filename = fields.String()
    filecontent = fields.String()


class Ref(Resource):
    def get(self):
        try:
            refs = current_app.REF_DOCS.choices()
            return refs, 200
        except:
            return '', 400

    def post(self):
        try:
            ref_loader = RefSchema()
            ref = ref_loader.load(request.json)
            filename, filecontent = ref["filename"], ref["filecontent"]
            current_app.REF_DOCS[filename] = filecontent.splitlines()
            return '', 200
        except:
            return '', 400
