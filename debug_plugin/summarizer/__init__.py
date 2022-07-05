from datetime import datetime
from time import sleep

class SummarizerPlugin:
    def __init__(self):
        pass

    def summarize(
        self,
        text,
        ratio,
        fail,
        error,
        error_message,
        time,
        extra_message,
        summary,
        high_load
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
        return f"{text[:20]}... {summary} {extra_message} {ratio}"
