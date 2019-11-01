from flask_wtf import FlaskForm
from wtforms import HiddenField, TextField, SelectField, FileField
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


class OutputSaveForm(FlaskForm):
    metric_info = HiddenField("metric_info", validators=[DataRequired()])
    name = TextField("name", validators=[DataRequired()])

    def __init__(self, *args, **kwargs):
        super(OutputSaveForm, self).__init__(*args, **kwargs)
