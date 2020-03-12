from flask import Blueprint, current_app
from flask_restx import Api

bp = Blueprint("api", __name__)
api = Api(bp)

from app.common.metrics import Metrics
from app.common.calculation import Calculation, SavedCalculations


def load_resources():
    current_app.SAVED_CALCULATIONS = SavedCalculations()
    current_app.METRICS = Metrics()


bp.before_app_first_request(load_resources)

from .resources.savedcalculations import SavedCalculationResource, SavedCalculationsResource
from .resources.calculate import CalculateResource

api.add_resource(CalculateResource, "/calculate", endpoint="calculate")
api.add_resource(SavedCalculationsResource, "/calculations", endpoint="calculations")
api.add_resource(SavedCalculationResource, "/calculation/<string:name>", endpoint="calculation")
