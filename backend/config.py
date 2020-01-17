import os

class Config():
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dljfaksdjf lkasd'
    BOOTSTRAP_USE_MINIFIED = False
    BOOTSTRAP_SERVE_LOCAL = True
    DATA_PATH = os.path.expanduser("~/.cache/compfile")
    GLOVE_BIN = "glove.6B.300d.model.bin"
