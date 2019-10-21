from flask import request
from flask_wtf import FlaskForm
from wtforms import SelectField, FileField
from wtforms.validators import DataRequired



class FilesSubmitForm(FlaskForm):
    file_left = SelectField("file_left", validators=[DataRequired()])
    file_right = SelectField("file_right", validators=[DataRequired()])

    def __init__(self, *args, **kwargs):
        super(FilesSubmitForm, self).__init__(*args, **kwargs)

class FileUploadForm(FlaskForm):
    file = FileField("file_upload", validators=[DataRequired()])

    def __init__(self, *args, **kwargs):
        super(FileUploadForm, self).__init__(*args, **kwargs)
