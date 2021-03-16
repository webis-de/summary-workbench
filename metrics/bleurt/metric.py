from pathlib import Path

import bleurt.score
import numpy as np
from urllib.parse import urljoin


class BLEURTScorer:
    MODEL = "bleurt-base-128"
    MODEL_BASE_URL = "https://storage.googleapis.com/bleurt-oss/"
    MODEL_PATH = Path("~/.cache/bleurt/").expanduser()

    @classmethod
    def MODEL_URL(cls):
        return urljoin(cls.MODEL_BASE_URL + "/", cls.MODEL + ".zip")

    def __init__(self):
        self.bleurt = bleurt.score.BleurtScorer(str(self.MODEL_PATH / self.MODEL))

    def score(self, hypotheses, references):
        return {"bleurt": float(np.average(self.bleurt.score(references, hypotheses)))}
