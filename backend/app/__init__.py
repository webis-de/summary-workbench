from flask import Flask
from flask.cli import with_appcontext
from flask_cors import CORS
import click

# config
from config import Config

# blueprints
from app.api import bp as api_bp

# services

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

    # register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    # register commands
    app.cli.add_command(_setup)

    return app
