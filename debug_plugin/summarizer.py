from datetime import datetime
from time import sleep
from typing import Literal

from pydantic import Field


class SummarizerPlugin:
    def __init__(self):
        pass

    def summarize(
        self,
        batch,
        ratio,
        return_list: bool = False,
        return_data: Literal["real", "none", "error"] = "real",
        high_load: bool = True,
        summary: str = "test summary",
        extra_message: float = Field(0, ge=-500, le=500),
        time: int = Field(0, ge=-1, le=1000),
        error_message: str = Field("test error", textarea=True),
        fail: bool = False,
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
            if return_list:
                return [[f"{text[:20]}... {summary}", f"{extra_message}", f"{ratio}"] for text in batch]
            return [f"{text[:20]}... {summary} {extra_message} {ratio}" for text in batch]
        if return_data == "none":
            return [None] * len(batch)
        if return_data == "error":
            return [{"somedata": [1, 2, None]}] * len(batch)
        raise ValueError(f"unknown return_data {return_data}")
