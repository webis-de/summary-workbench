from flask import current_app, request
from flask_restful import Resource

from app.common.calculation import Calculation, SavedCalculations
from app.common.filehandler import FileHandler
from app.common.metrics import Metrics
from app.common.settings import Settings


class SessionResource(Resource):
    def delete(self):
        current_app.HYP_DOCS = FileHandler()
        current_app.REF_DOCS = FileHandler()
        current_app.SAVED_CALCULATIONS = SavedCalculations()
        current_app.SETTINGS = Settings(current_app.METRICS.metrics_info)
