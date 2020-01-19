from flask import Flask
from flask_cors import CORS

# config
from config import Config

# blueprints
from app.api import bp as api_bp

# commands
from app.common.setup import setup

# services

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # init servies
    CORS(app)

    # register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    # register commands
    app.cli.add_command(setup)

    # better jinja render behaviour
    app.jinja_env.trim_blocks = True
    app.jinja_env.lstrip_blocks = True

    return app
