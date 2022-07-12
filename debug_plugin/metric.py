from datetime import datetime
from time import sleep


class MetricPlugin:
    def __init__(self):
        pass

    def evaluate(
        self,
        hypotheses,
        references,
        fail,
        error,
        error_message,
        time,
        extra_message,
        summary,
        high_load,
        return_data,
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
            return [extra_message] * len(hypotheses)
        if return_data == "none":
            return None
        if return_data == "error":
            return [1, None, "test", 0.2, -10, {"1": "test"}, [1, 2, 3]]
        raise ValueError(f"unknown return_data {return_data}")
