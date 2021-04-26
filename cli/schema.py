from pathlib import Path
from marshmallow import Schema, fields, validate

def validate_name(name):
    return name.replace("_", "").isalnum()

class PluginSchema(Schema):
    name = fields.Str(
        validate=validate_name,
        error_messages={"validator_failed": "only alphanumeric signs and '_' allowed"},
    )
    readable = fields.Str()
    volumes = fields.List(fields.Str())
    model = fields.Str()
    version = fields.Str()
    devimage = fields.Str(
        validate=validate.OneOf(
            [path.name for path in Path("./images/dev").glob("*")]
        )
    )
    deployimage = fields.Str(
        validate=validate.OneOf(
            [path.name for path in Path("./images/deploy").glob("*")]
        )
    )
    homepage = fields.Url()
    sourcecode = fields.Url()


class MetricPluginSchema(PluginSchema):
    type = fields.Str(validate=validate.OneOf(["lexical", "semantic"]))


class SummarizerPluginSchema(PluginSchema):
    type = fields.Str(validate=validate.OneOf(["abstractive", "extractive"]))


class GlobalConfigSchema(Schema):
    source = fields.Str(required=True)
    image_url = fields.Str()
    environment = fields.Dict(missing={})


class GlobalMetricConfigSchema(GlobalConfigSchema):
    config = fields.Nested(MetricPluginSchema)


class GlobalSummarizerConfigSchema(GlobalConfigSchema):
    config = fields.Nested(SummarizerPluginSchema)
