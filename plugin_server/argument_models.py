from typing import List, Literal, Optional

from pydantic import BaseModel, Field, validator


class IntArgument(BaseModel):
    type: Literal["int"] = Field(description="type of the argument")
    default: Optional[int] = Field(description="default argument for that field")
    display: Optional[str] = Field(description="text that will be shown as name in the frontend")
    min: Optional[int] = Field(description="minimal value for that argument")
    max: Optional[int] = Field(description="maximal value for that argument")


class FloatArgument(BaseModel):
    type: Literal["float"] = Field(description="type of the argument")
    default: Optional[float] = Field(description="default argument for that field")
    display: Optional[str] = Field(description="text that will be shown as name in the frontend")
    min: Optional[float] = Field(description="minimal value for that argument")
    max: Optional[float] = Field(description="maximal value for that argument")


class BoolArgument(BaseModel):
    type: Literal["bool"] = Field(description="type of the argument")
    default: Optional[bool] = Field(description="default argument for that field")
    display: Optional[str] = Field(description="text that will be shown as name in the frontend")


class StringArgument(BaseModel):
    type: Literal["str"] = Field(description="type of the argument")
    useTextarea: bool = Field(False, description="if true, a textarea will be used for text input in the frontend instead of an normal input field")
    default: Optional[str] = Field(description="default argument for that field")
    display: Optional[str] = Field(description="text that will be shown as name in the frontend")


class CategoricalArgument(BaseModel):
    type: Literal["categorical"] = Field(description="type of the argument")
    categories: List[str] = Field(description="list of categories")
    default: Optional[str] = Field(description="default argument for that field")
    display: Optional[str] = Field(description="text that will be shown as name in the frontend")

    @validator("default")
    def in_categories(cls, value, values):
        if value is not None and value not in values["categories"]:
            raise ValueError(f"{value} must be one of {values['categories']}")
        return value
