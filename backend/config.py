from os import environ

class Config():
    MONGODB_HOST = environ.get("MONGODB_HOST")
