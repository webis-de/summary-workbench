from flask import Blueprint, current_app
from flask_restful import Api


bp = Blueprint("api", __name__)
api = Api(bp)

from app.common.filehandler import FileHandler
from app.common.metrics import Metrics
from app.common.calculation import Calculation, SavedCalculations
from app.common.settings import Settings

def load_resources():
    current_app.HYP_DOCS = FileHandler()
    current_app.REF_DOCS = FileHandler()
    current_app.SAVED_CALCULATIONS = SavedCalculations()
    current_app.METRICS = Metrics()
    current_app.SETTINGS = Settings(current_app.METRICS.metrics_info)


bp.before_app_first_request(load_resources)

from .resources.hyp import Hyp
from .resources.ref import Ref
from .resources.savedcalculations import SavedCalculations
from .resources.session import Session
from .resources.setting import Setting
from .resources.lastcalculation import LastCalculation

api.add_resource(LastCalculation, "/calculation")
api.add_resource(Hyp, "/hyp")
api.add_resource(Ref, "/ref")
api.add_resource(SavedCalculations, "/save/<string:name>")
api.add_resource(Setting, "/setting")
