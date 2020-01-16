from ast import literal_eval
from collections import defaultdict, OrderedDict
from flask import request
from flask_restful import Resource
from marshmallow import Schema, fields
from flask import current_app

from .. import bp
from app.common.filehandler import FileHandler
from app.common.savedcalculations import SavedCalculations
from app.common.metrics import Metrics


HYP_DOCS = None
REF_DOCS = None
SAVED_CALCULATIONS = None
SETTINGS = None
METRICS = None


def load_resources():
    global HYP_DOCS
    global REF_DOCS
    global SAVED_CALCULATIONS
    global METRICS
    global SETTINGS

    HYP_DOCS = FileHandler()
    REF_DOCS = FileHandler()
    SAVED_CALCULATIONS = SavedCalculations()

    METRICS = Metrics()
    SETTINGS = {}

    for metric in sorted(METRICS.avail_metrics):
        metric_readable = " ".join(map(str.capitalize, metric.split("_")))
        SETTINGS[metric] = {
            "is_set": False,
            "readable": metric_readable,
        }
bp.before_app_first_request(load_resources)


def gen_rouge_table(rouge_info):
    table = {}
    keys = sorted(next(iter(rouge_info.values())).keys())
    thead = [""] + keys

    tbody = []
    for metric, info in rouge_info.items():
        tbody.append([metric] + ["{:.2f}".format(info[key]) for key in keys])

    table["thead"] = thead
    table["tbody"] = tbody

    return table


def gen_tables(scores):
    tables = {}
    for metric, info in scores.items():
        if metric in ["cider", "meteor", "greedy_matching"]:
            thead = ["", "score"]
            tbody = [[metric, info]]
            tables[metric] = {
                "thead": thead,
                "tbody": tbody,
            }

        if metric == "bleu":
            thead = ["", "score"]
            tbody = list(info.items())
            tables[metric] = {
                "thead": thead,
                "tbody": tbody,
            }

        if metric == "rouge":
            tables["rouge"] = gen_rouge_table(info)

    return OrderedDict(sorted(tables.items()))


def get_info(file_hyp, file_ref):
    set_metrics = [metric for metric, info in SETTINGS.items() if info["is_set"]]
    scores = METRICS.compute(set_metrics, file_hyp, file_ref)
    return gen_tables(scores)


class SettingSchema(Schema):
    metric = fields.String()
    is_set = fields.Boolean()


class Setting(Resource):
    def post(self):
        setting_loader = SettingSchema()
        try:
            setting = setting_loader.load(request.json)
            metric, is_set = setting["metric"], setting["is_set"]
            current_app.logger.info(setting)
            SETTINGS[metric]["is_set"] = is_set
        except Exception as e:
            return '', 400

        return '', 200

    def delete(self):
        HYP_DOCS.clear()
        REF_DOCS.clear()
        return '', 200


class Session(Resource):
    def delete(self):
        HYP_DOCS = FileHandler()
        REF_DOCS = FileHandler()
        SAVED_CALCULATIONS = SavedCalculations()

        SETTINGS = {}

        for metric in sorted(METRICS.avail_metrics):
            metric_readable = " ".join(map(str.capitalize, metric.split("_")))
            SETTINGS[metric] = {
                "is_set": False,
                "readable": metric_readable,
            }


class HypRefSchema(Resource):
    filename = fields.String()
    filecontent = fields.String()


class Hyp(Resource):
    def get(self):
        hyps = HYP_DOCS.choices()
        return {
            "hyps": hyps
        }, 200

    def post(self):
        hyp_loader = HypRefSchema()
        try:
            hyp = hyp_loader.load(request.json)

            filename, filecontent = hyp["filename"], hyp["filecontent"]

            HYP_DOCS[filename] = filecontent.splitlines()
        except:
            return '', 400

        return '', 200


class Ref(Resource):
    def get(self):
        refs = REF_DOCS.choices()
        return {
            "refs": refs
        }, 200

    def post(self):
        ref_loader = HypRefSchema()
        try:
            ref = ref_loader.load(request.json)

            filename, filecontent = ref["filename"], ref["filecontent"]

            REF_DOCS[filename] = filecontent.splitlines()
        except:
            return '', 400

        return '', 200


class CalculationSchema(Resource):
    hypname = fields.String()
    refname = fields.String()


class Calculation(Resource):
    def get(self):
        calculation_loader = CalculationSchema()
        try:
            file_names = calculation_loader.load(request.json)
            hypname, refname = file_names["hypname"], file_names["refname"]
            hypdata = HYP_DOCS[hypname]
            refdata = REF_DOCS[refname]
        except:
            return '', 400

        return {
            "hypdata": hypdata
            "refdata": refdata
        }, 200

    def post(self):
        try:
            data = request.json
            name = data["name"]
            tables = data["metric_info"]
            hyps = literal_eval(data["hyps"])
            refs = literal_eval(data["refs"])
            tables = OrderedDict(sorted(literal_eval(tables).items()))
            SAVED_CALCULATIONS.append(name, tables, hyps, refs)
        except:
            return '', 400

        return '', 200


class SavedSchema(Schema):
    id = fields.String()


class SavedCalculations(Resource):
    def get(self):
        saved_loader = SavedSchema()
        try:
            info = saved_loader.load(request.json)
            id = info["id"]
            _, _, hyps, refs = SAVED_CALCULATIONS.get(id)
            return {
                "hyps_refs": list(map(list, zip(hyps, refs)))
            }, 200
        except Exception as e:
            return '', 400
