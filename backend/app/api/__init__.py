from flask import Blueprint, current_app
from flask_restx import Api

from app.common.calculation import SavedCalculations
from app.common.metrics import Metrics
from app.common.summarize import BertSummarizer, TextRankSummarizer

from .resources.calculate import CalculateResource
from .resources.export import ExportResource
from .resources.savedcalculations import (SavedCalculationResource,
                                          SavedCalculationsResource)
from .resources.summarize import BertSummarizerResource, TextRankResource

bp = Blueprint("api", __name__)
api = Api(bp)


def load_resources():
    current_app.SAVED_CALCULATIONS = SavedCalculations()
    current_app.METRICS = Metrics()
    current_app.TEXTRANK_SUM = TextRankSummarizer()
    current_app.BERT_SUM = BertSummarizer()


bp.before_app_first_request(load_resources)


api.add_resource(CalculateResource, "/calculate", endpoint="calculate")
api.add_resource(SavedCalculationsResource, "/calculations", endpoint="calculations")
api.add_resource(
    SavedCalculationResource, "/calculation/<string:name>", endpoint="calculation"
)
api.add_resource(ExportResource, "/export", endpoint="export")
api.add_resource(BertSummarizerResource, "/summarize/bert", endpoint="bertsum")
api.add_resource(TextRankResource, "/summarize/textrank", endpoint="textrank")
