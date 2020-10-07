import datetime
import json
import os
import glob
import itertools


from flask import Flask, render_template, request, redirect, url_for, send_from_directory, current_app
from werkzeug.utils import secure_filename


app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = os.path.dirname(os.path.abspath(__file__)) + '/uploads/'
app.config['CORPUS_FOLDER'] = os.path.dirname(os.path.abspath(__file__)) + '/corpus/'

ALLOWED_EXTENSIONS =  ['json', 'txt']

def allowed_file(filename):
    return '.' in filename and filename.split('.',1)[1].lower() in ALLOWED_EXTENSIONS

def parse_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as inf:
        record = json.load(inf)
    return record

@app.route("/")
def template_test():
    return render_template('index.html', current_time=datetime.datetime.now())
    
@app.route("/view-summaries", methods=['GET', 'POST'])
def visualize_summaries():
    if request.method == "POST":
        req = request.form
        print(req.get("model"))
        model_file_name = req.get("model") +"-merged.json"
        model_file_path = os.path.join(app.config['UPLOAD_FOLDER'], model_file_name)
        model_records = parse_file(model_file_path)
        if model_records:
            print("Finished parsing")
            return render_template('two-column-view.html', records=model_records['items'], model_name=model_records['model'])
        else:
            return render_template('error.html')


@app.route("/compare-summaries", methods=['GET', 'POST'])
def compare_summaries():
    if request.method == "POST":
        selected_models = request.form.getlist('model-comparison')
        processed_records = []
        all_summaries = []
        document_file_path = os.path.join(app.config['CORPUS_FOLDER'], 'documents.txt')
        reference_file_path = os.path.join(app.config['CORPUS_FOLDER'], 'references.txt')
        documents = [line for line in open(document_file_path, 'r', encoding='utf-8')]
        references = ["Reference || " + line for line in open(reference_file_path, 'r', encoding='utf-8')]
        all_summaries.append(references)
        for model in selected_models:
            model_file_name = model + "-predictions.txt"
            model_file_path = os.path.join(app.config['CORPUS_FOLDER'], model_file_name)
            summaries = [model + " || " + line for line in open(model_file_path, 'r', encoding='utf-8')]
            all_summaries.append(summaries)
        
        zipped_summaries = list(zip(*all_summaries))
        for doc, summaries in zip(documents, zipped_summaries):
            record = {}
            record['document'] = doc
            record['summaries'] = list(summaries)
            processed_records.append(record)
        return render_template('multiple-summaries.html', processed_records=processed_records)
    
@app.route("/compare-filtered-summaries", methods=['GET', 'POST'])
def compare_filtered_summaries():
    if request.method == "POST":
        selected_models = request.form.getlist('model-comparison-filtered')
        processed_records = []
        all_summaries = []
        document_file_path = os.path.join(app.config['CORPUS_FOLDER'], 'documents-filtered.txt')
        reference_file_path = os.path.join(app.config['CORPUS_FOLDER'], 'references-filtered.txt')
        documents = [line for line in open(document_file_path, 'r', encoding='utf-8')]
        references = ["Reference || " + line for line in open(reference_file_path, 'r', encoding='utf-8')]
        all_summaries.append(references)
        for model in selected_models:
            model_file_name = model + "-predictions.txt"
            model_file_path = os.path.join(app.config['CORPUS_FOLDER'], model_file_name)
            summaries = [model + " || " + line for line in open(model_file_path, 'r', encoding='utf-8')]
            all_summaries.append(summaries)
        
        zipped_summaries = list(zip(*all_summaries))
        for doc, summaries in zip(documents, zipped_summaries):
            record = {}
            record['document'] = doc
            record['summaries'] = list(summaries)
            processed_records.append(record)
        return render_template('multiple-summaries.html', processed_records = processed_records)


@app.route("/", methods=['GET', 'POST'])
def file_upload():
    if request.method == 'POST':
        if 'file' not in request.files:
            print(request)
            print("No file attached")
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            print("No file selected")
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            processed_record = parse_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            if processed_record:
                print("Finished parsing")   
                return render_template('two-column-view.html',records = processed_record['items'], model_name = processed_record['model'])
            else:
                return render_template('error.html')

if __name__ == "__main__":
    app.run()