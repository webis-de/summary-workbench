import os

class Config():
    SECRET_KEY = os.environ.get('SECRET_KEY') or ''
    WTF_CSRF_ENABLED = False                  # protect against csrf-attack
