import click

from flask import Flask, make_response
from flask.cli import with_appcontext
from flask_cors import CORS
from flask_mongoengine import MongoEngine


# config
from config import Config

# services
mongo = MongoEngine()

# blueprints
from app.api import bp as api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # init servies
    CORS(app)
    mongo.init_app(app)

    # register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/health")
    def health():
        return make_response("", 200)

    return app
