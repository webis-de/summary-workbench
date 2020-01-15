from flask import Flask
from flask_bootstrap import Bootstrap

# config
from config import Config

# blueprints
from app.api import bp as api_bp
from app.standalone import bp as standalone_bp

# commands
from app.setup import setup

# services
bootstrap = Bootstrap()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # init servies
    bootstrap.init_app(app)

    # register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(standalone_bp, url_prefix="/standalone")

    # register commands
    app.cli.add_command(setup)

    # better jinja render behaviour
    app.jinja_env.trim_blocks = True
    app.jinja_env.lstrip_blocks = True

    return app
