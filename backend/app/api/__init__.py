from flask import Blueprint
from flask_restful import Api

from .resources.base import Setting

bp = Blueprint("api", __name__)
api = Api(bp)

api.add_resource(Setting, "/setting")
