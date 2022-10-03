import os
from pathlib import Path
from urllib.parse import urljoin

import bleurt.score


class MetricPlugin:
    MODEL = os.environ.get("model") or "bleurt-base-128"
    MODEL_BASE_URL = "https://storage.googleapis.com/bleurt-oss/"
    MODEL_PATH = Path("~/.cache/bleurt/").expanduser()

    @classmethod
    def MODEL_URL(cls):
        return urljoin(cls.MODEL_BASE_URL + "/", cls.MODEL + ".zip")

    def __init__(self):
        self.bleurt = bleurt.score.BleurtScorer(str(self.MODEL_PATH / self.MODEL))

    def evaluate(self, batch, references):
        return [self.bleurt.score(references=references, candidates=hypotheses) for hypotheses in batch]
