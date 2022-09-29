from typing import Union

from pydantic import BaseModel, Field, root_validator, validator


def to_list(value):
    if isinstance(value, str):
        return [value]
    return value


class MetricBase(BaseModel):
    hypotheses: Union[str, list]
    references: Union[str, list]

    hypotheses_validator = validator("hypotheses", allow_reuse=True)(to_list)
    references_validator = validator("references", allow_reuse=True)(to_list)

    @root_validator()
    def same_number_lines(_, values):
        if len(values["hypotheses"]) != len(values["references"]):
            raise ValueError("hypotheses and references have to have the same length")
        return values


class SummarizerBase(BaseModel):
    text: str
    ratio: float = Field(
        ..., gt=0, lt=1, description="The ratio must be in the closed interval (0,1)"
    )
