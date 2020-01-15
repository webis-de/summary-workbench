from ast import literal_eval
from collections import defaultdict, OrderedDict
from flask import request
from flask_restful import Resource
from marshmallow import Schema, fields

from .. import bp
from .forms import FilesSubmitForm, FileUploadForm, OutputSaveForm
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


class SettingSchema(Schema):
    metric = fields.String()
    is_set = fields.Boolean()


class Setting(Resource):
    def post(self):
        setting_loader = SettingSchema()
        try:
            setting = setting_loader.load(request.json)
            metric, is_set = setting.metric, setting.is_set
            SETTINGS[metric]["is_set"] = is_set
        except Exception as e:
            return {"success": False}

        return {"success": True}

    def delete(self):
        HYP_DOCS.clear()
        REF_DOCS.clear()
        return '', 200


class Session(Resource):
    def delete(self):
        pass


class HypForm(Resource):
    def post(self):
        pass


class RefForm(Resource):
    def post(self):
        pass


class CalculationSchema(Resource):
    id = fields.Int()


class Calculation(Resource):
    def get(self):
        try:
            info = (request.form["info"])
            id = info["id"]
            _, _, hyps, refs = SAVED_CALCULATIONS.get(id)
            return {
                "hyps_refs": list(map(list, zip(hyps, refs)))
            }
        except Exception as e:
            return '', 400


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


@bp.route("/", methods=["GET", "POST"])
def index():
    form_choice = FilesSubmitForm()
    form_upload_hyp = FileUploadForm(prefix="form_hyp")
    form_upload_ref = FileUploadForm(prefix="form_ref")
    form_save = OutputSaveForm()
    form_choice.file_hyp.choices = HYP_DOCS.choices()
    form_choice.file_ref.choices = REF_DOCS.choices()

    try:
        if form_choice.validate_on_submit():
            file_hyp_name = form_choice.file_hyp.data
            file_ref_name = form_choice.file_ref.data
            file_hyp = HYP_DOCS[file_hyp_name]
            file_ref = REF_DOCS[file_ref_name]

            # dict for later literal_eval if want to save
            score_tables = dict(get_info(file_hyp, file_ref))

            form_save.name.data = file_hyp_name + "-" + file_ref_name
            form_save.metric_info.data = score_tables
            form_save.hyps.data = file_hyp
            form_save.refs.data = file_ref

            return render_template(
                "index.html",
                form_choice=form_choice,
                form_upload_hyp=form_upload_hyp,
                form_upload_ref=form_upload_ref,
                form_save=form_save,
                result_tables=score_tables,
                saved_calcuations=SAVED_CALCULATIONS,
                settings=SETTINGS,
            )

        if form_upload_hyp.validate_on_submit():
            filename = form_upload_hyp.file.data.filename
            filecontent = form_upload_hyp.file.data.read().decode("utf-8")
            HYP_DOCS[filename] = filecontent.splitlines()

        if form_upload_ref.validate_on_submit():
            filename = form_upload_ref.file.data.filename
            filecontent = form_upload_ref.file.data.read().decode("utf-8")
            REF_DOCS[filename] = filecontent.splitlines()

        if form_save.validate_on_submit():
            name = form_save.name.data
            tables = form_save.metric_info.data
            hyps = literal_eval(form_save.hyps.data)
            refs = literal_eval(form_save.refs.data)
            tables = OrderedDict(sorted(literal_eval(tables).items()))
            SAVED_CALCULATIONS.append(name, tables, hyps, refs)
    except Exception as e:
        flash(e)


    form_choice.file_hyp.choices = HYP_DOCS.choices()
    form_choice.file_ref.choices = REF_DOCS.choices()

    return render_template(
        "index.html",
        form_choice=form_choice,
        form_upload_hyp=form_upload_hyp,
        form_upload_ref=form_upload_ref,
        saved_calculations=SAVED_CALCULATIONS,
        settings=SETTINGS,
    )
