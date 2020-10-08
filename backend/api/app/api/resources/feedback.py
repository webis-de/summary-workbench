from flask import current_app, request
from flask_restx import Resource
from marshmallow import Schema, fields, validate
from app.common import Metrics
from app.models import Feedback


class FeedbackSchema(Schema):
    summarizer = fields.String(required=True)
    summary = fields.String(required=True)
    reference = fields.String(required=True)
    url = fields.String()
    feedback = fields.String(required=True)


class FeedbackResource(Resource):
    def post(self):
        try:
            feedback_args = FeedbackSchema().load(request.json)
            summarizer = feedback_args["summarizer"]
            summary = feedback_args["summary"]
            reference = feedback_args["reference"]
            url = feedback_args.get("url")
            feedback = feedback_args["feedback"]
            Feedback.insert_entry(summarizer=summarizer, summary=summary, reference=reference, feedback=feedback, url=url)
            return "", 200
        except Exception as error:
            current_app.logger.warn(error)
            return "", 400
