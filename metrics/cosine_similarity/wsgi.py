import logging

from app import app

if __name__ == "__main__":
    app.run("0.0.0.0", 5000, debug=True)
else:
    gunicorn_logger = logging.getLogger("gunicorn.error")
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)
