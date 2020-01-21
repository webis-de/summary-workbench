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
    current_app.logger.info(type(current_app.SAVED_CALCULATIONS))
    current_app.METRICS = Metrics()
    current_app.SETTINGS = Settings(current_app.METRICS.metrics_info)
    current_app.LAST_CALCULATION = None


bp.before_app_first_request(load_resources)

from .resources.hyp import HypResource
from .resources.ref import RefResource
from .resources.savedcalculations import SavedCalculationsResource
from .resources.session import SessionResource
from .resources.setting import SettingResource
from .resources.lastcalculation import LastCalculationResource

api.add_resource(LastCalculationResource, "/calculation")
api.add_resource(HypResource, "/hyp")
api.add_resource(RefResource, "/ref")
api.add_resource(SavedCalculationsResource, "/save")
api.add_resource(SettingResource, "/setting")
