import datetime
import json
from pathlib import Path

from flask import (Blueprint, Flask, current_app, redirect, render_template, request)
from werkzeug.utils import secure_filename

app = Flask(__name__)

bp = Blueprint("summary_viewer", __name__, static_folder="static", template_folder="templates")

app_dir = Path(__file__).parent

app.config["UPLOAD_FOLDER"] = app_dir / "uploads"
app.config["CORPUS_FOLDER"] = app_dir / "corpus"

ALLOWED_EXTENSIONS = ["json", "txt"]


def allowed_file(filename):
    return "." in filename and filename.split(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def parse_file(filepath):
    with open(filepath, "r", encoding="utf-8") as inf:
        record = json.load(inf)
    return record


@bp.route("/")
def template_test():
    current_app.logger.warning("hello")
    return render_template("index.html", current_time=datetime.datetime.now())


@bp.route("/view-summaries", methods=["GET", "POST"])
def visualize_summaries():
    if request.method == "POST":
        req = request.form
        print(req.get("model"))
        model_file_name = req.get("model") + "-merged.json"
        model_file_path = app.config["UPLOAD_FOLDER"] / model_file_name
        model_records = parse_file(model_file_path)
        if model_records:
            print("Finished parsing")
            return render_template(
                "two-column-view.html",
                records=model_records["items"],
                model_name=model_records["model"],
            )
        else:
            return render_template("error.html")


@bp.route("/compare-summaries", methods=["GET", "POST"])
def compare_summaries():
    if request.method == "POST":
        selected_models = request.form.getlist("model-comparison")
        processed_records = []
        all_summaries = []
        document_file_path = app.config["CORPUS_FOLDER"] / "documents.txt"
        reference_file_path = app.config["CORPUS_FOLDER"] / "references.txt"
        documents = [line for line in open(document_file_path, "r", encoding="utf-8")]
        references = [
            "Reference || " + line
            for line in open(reference_file_path, "r", encoding="utf-8")
        ]
        all_summaries.append(references)
        for model in selected_models:
            model_file_name = model + "-predictions.txt"
            model_file_path = app.config["CORPUS_FOLDER"] / model_file_name
            summaries = [
                model + " || " + line
                for line in open(model_file_path, "r", encoding="utf-8")
            ]
            all_summaries.append(summaries)

        zipped_summaries = list(zip(*all_summaries))
        for doc, summaries in zip(documents, zipped_summaries):
            record = {}
            record["document"] = doc
            record["summaries"] = list(summaries)
            processed_records.append(record)
        return render_template(
            "multiple-summaries.html", processed_records=processed_records
        )


@bp.route("/compare-filtered-summaries", methods=["GET", "POST"])
def compare_filtered_summaries():
    if request.method == "POST":
        selected_models = request.form.getlist("model-comparison-filtered")
        processed_records = []
        all_summaries = []
        document_file_path = app.config["CORPUS_FOLDER"] / "documents-filtered.txt"
        reference_file_path = app.config["CORPUS_FOLDER"] / "references-filtered.txt"
        documents = [line for line in open(document_file_path, "r", encoding="utf-8")]
        references = [
            "Reference || " + line
            for line in open(reference_file_path, "r", encoding="utf-8")
        ]
        all_summaries.append(references)
        for model in selected_models:
            model_file_name = model + "-predictions.txt"
            model_file_path = app.config["CORPUS_FOLDER"] / model_file_name
            summaries = [
                model + " || " + line
                for line in open(model_file_path, "r", encoding="utf-8")
            ]
            all_summaries.append(summaries)

        zipped_summaries = list(zip(*all_summaries))
        for doc, summaries in zip(documents, zipped_summaries):
            record = {}
            record["document"] = doc
            record["summaries"] = list(summaries)
            processed_records.append(record)
        return render_template(
            "multiple-summaries.html", processed_records=processed_records
        )


@bp.route("/", methods=["GET", "POST"])
def file_upload():
    if request.method == "POST":
        if "file" not in request.files:
            print(request)
            print("No file attached")
            return redirect(request.url)
        file = request.files["file"]
        if file.filename == "":
            print("No file selected")
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(app.config["UPLOAD_FOLDER"] / filename)
            processed_record = parse_file(app.config["UPLOAD_FOLDER"] / filename)
            if processed_record:
                print("Finished parsing")
                return render_template(
                    "two-column-view.html",
                    records=processed_record["items"],
                    model_name=processed_record["model"],
                )
            else:
                return render_template("error.html")


@app.route("/health")
def health():
    return "", 200

app.register_blueprint(bp, url_prefix="/summary_viewer")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
