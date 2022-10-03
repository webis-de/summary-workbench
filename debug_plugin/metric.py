from datetime import datetime
from time import sleep
from typing import Literal

from pydantic import Field


class MetricPlugin:
    def __init__(self):
        pass

    def evaluate(
        self,
        batch,
        return_data: Literal["real", "none", "error"] = "real",
        high_load: bool = True,
        summary: str = "test summary",
        extra_message: float = Field(0, ge=-500, le=500),
        time: int = Field(0, ge=-1, le=1000),
        error_message: str = Field("test error", textarea=True),
        fail: bool = True,
        error: Literal["ValueError", "Exception", "AttributeError"] = "ValueError",
    ):
        if time > 0:
            if high_load:
                start = datetime.now()
                while (datetime.now() - start).total_seconds() < time:
                    pass
            else:
                sleep(time)
        if fail:
            if error == "ValueError":
                raise ValueError(error_message)
            if error == "Exception":
                raise Exception(error_message)
            if error == "AttributeError":
                raise AttributeError(error_message)
            raise ValueError(f"unknown error type {error}")
        if return_data == "real":
            return [[extra_message] * len(hyp) for hyp, _ in batch]
        if return_data == "none":
            return [None] * len(batch)
        if return_data == "error":
            return [[1, None, "test", 0.2, -10, {"1": "test"}, [1, 2, 3]]] * len(batch)
        raise ValueError(f"unknown return_data {return_data}")
