from flask import request
from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField
from wtforms.validators import DataRequired



class FilesSubmitForm(FlaskForm):
    file1 = StringField('file1', validators=[DataRequired()])
    file2 = StringField('file2', validators=[DataRequired()])

    def __init__(self, *args, **kwargs):
        kwargs['formdata'] = request.args
        kwargs['csrf_enabled'] = False
        super(FilesSubmitForm, self).__init__(*args, **kwargs)
