import datetime
from itertools import count

from flask_mongoengine import ValidationError
from mongoengine.errors import NotUniqueError

from app import mongo


def length2(l):
    if len(l) != 2:
        raise ValidationError("the list has to have size 2")


def recursiv_list_or_string(arg):
    if not isinstance(arg, str) and not isinstance(arg, list):
        raise ValidationError("has to be string or list")
    if isinstance(arg, list):
        for element in arg:
            recursiv_list_or_string(element)


class Calculation(mongo.Document):
    name = mongo.StringField(primary_key=True)
    comparisons = mongo.ListField(
        mongo.ListField(
            mongo.DynamicField(validation=recursiv_list_or_string),
            validation=length2,
            required=True,
        )
    )
    scores = mongo.DictField(mongo.DictField(mongo.FloatField()))
    date_modified = mongo.DateTimeField(default=datetime.datetime.utcnow)

    @staticmethod
    def insert_entry(name, comparisons, scores={}):
        oldname = name
        i = 1

        while True:
            try:
                Calculation(name=name, comparisons=comparisons, scores=scores).save(
                    force_insert=True
                )
                break
            except NotUniqueError:
                name = oldname + "-" + str(i)
                i += 1

    @staticmethod
    def delete_entry(name):
        Calculation.get(name).delete()

    @staticmethod
    def all_without_comparisons():
        calculations = (
            Calculation.objects.order_by("-date_modified")
            .only("name")
            .only("scores")
            .all()
        )
        return [{"name": calc.name, "scores": calc.scores} for calc in calculations]

    @staticmethod
    def get(name):
        return Calculation.objects.get(name=name)
