from flask import render_template
from flask import jsonify
from app import app
from app.forms import FilesSubmitForm



@app.route('/', methods=['GET', 'POST'])
def index():
    form = FilesSubmitForm()
    if form.validate():
        file1 = form.file1.data
        file2 = form.file2.data
        return render_template('metrics.html', form=form)
    else:
        return render_template('index.html', form=form)
