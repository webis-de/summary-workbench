import click

from flask import Flask
from flask.cli import with_appcontext
from flask_cors import CORS
from flask_mongoengine import MongoEngine

# config
from config import Config

# services
mongo = MongoEngine()

# blueprints
from app.api import bp as api_bp

# commands
from setup import setup
@click.command(name="setup", help="download necessary data")
@with_appcontext
def _setup():
    setup()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # init servies
    CORS(app)
    mongo.init_app(app)

    # register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    # register commands
    app.cli.add_command(_setup)

    return app
