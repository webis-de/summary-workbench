from os import environ

class Config():
    MONGODB_HOST = environ["MONGODB_HOST"]
