from flask import Blueprint
from flask_restful import Api

from .resources.res import Res

bp = Blueprint("api", __name__)
api = Api(bp)

api.add_resource(Res, "/")
