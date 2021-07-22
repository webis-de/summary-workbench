import re
from pathlib import Path
from marshmallow import Schema, fields, validate, ValidationError
from .config import DEV_IMAGES, DEPLOY_IMAGES
from .utils import abort


key_pattern = "_A-Za-z"


def validate_key(key):
    return re.match(f"^[{key_pattern}]+$", key)


class PluginSchema(Schema):
    version = fields.Str(required=True)
    name = fields.Str(required=True)
    devimage = fields.Str(validate=validate.OneOf(DEV_IMAGES))
    deployimage = fields.Str(validate=validate.OneOf(DEPLOY_IMAGES))
    metadata = fields.Dict(
        fields.String(
            validate=validate_key,
            error_messages={"validator_failed": f"only {key_pattern} allowed"},
        ),
        fields.Raw(),
        missing={},
    )

    def load(self, data):
        try:
            return super().load(data)
        except ValidationError as error:
            abort(error)


class GlobalConfigSchema(Schema):
    source = fields.Str(required=True)
    image_url = fields.Str()
    environment = fields.Dict(
        fields.String(
            validate=validate_key,
            error_messages={"validator_failed": f"only {key_pattern} allowed"},
        ),
        fields.Raw(),
        missing={},
    )

    def load(self, data):
        try:
            return super().load(data)
        except ValidationError as error:
            abort(error)
