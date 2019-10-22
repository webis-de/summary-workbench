from flask import render_template, redirect, jsonify, url_for
from app import app
from app.forms import FilesSubmitForm, FileUploadForm
from rouge import Rouge
from collections import defaultdict


left_docs = {}
right_docs = {}


@app.route("/", methods=["GET", "POST"])
def index():
    form_choice = FilesSubmitForm()
    form_upload_left = FileUploadForm(prefix="form_left")
    form_upload_right = FileUploadForm(prefix="form_right")

    form_choice.file_left.choices = [(key,key) for key in left_docs.keys()]
    form_choice.file_right.choices = [(key,key) for key in right_docs.keys()]
    if form_choice.validate_on_submit():
        file_left = left_docs[form_choice.file_left.data]
        file_right = right_docs[form_choice.file_right.data]
        rouge = Rouge()
        results = rouge.get_scores(file_left, file_right, avg=True)
        table = {}
        thead = [""]
        tbody = defaultdict(list)
        for metric, metric_info in results.items():
            thead.append(metric)
            for key, value in metric_info.items():
                tbody[key].append(value)
        table["thead"] = thead
        table["tbody"] = tbody
        return render_template("index.html", form_choice=form_choice, form_upload_left=form_upload_left, form_upload_right=form_upload_right, table=table)
    if form_upload_left.validate_on_submit():
        filename = form_upload_left.file.data.filename
        filecontent = form_upload_left.file.data.read().decode("utf-8")
        left_docs[filename] = filecontent.splitlines()
    if form_upload_right.validate_on_submit():
        filename = form_upload_right.file.data.filename
        filecontent = form_upload_right.file.data.read().decode("utf-8")
        right_docs[filename] = filecontent.splitlines()
    form_choice.file_left.choices = [(key,key) for key, value in left_docs.items()]
    form_choice.file_right.choices = [(key,key) for key, value in right_docs.items()]
    return render_template("index.html", form_choice=form_choice, form_upload_left=form_upload_left, form_upload_right=form_upload_right, results=None)


@app.route("/delete", methods=["GET", "POST"])
def upload_left():
    left_docs.clear()
    right_docs.clear()
    return redirect(url_for("index"))
