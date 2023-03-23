import os
from pathlib import Path
from urllib.parse import urljoin

import bleurt.score


class MetricPlugin:
    MODEL = os.environ.get("model") or "BLEURT-20"
    MODEL_BASE_URL = "https://storage.googleapis.com/bleurt-oss-21/"
    MODEL_PATH = Path("~/.cache/bleurt/").expanduser()

    @classmethod
    def MODEL_URL(cls):
        return urljoin(cls.MODEL_BASE_URL + "/", cls.MODEL + ".zip")

    def __init__(self):
        self.bleurt = bleurt.score.BleurtScorer(str(self.MODEL_PATH / self.MODEL))

    def evaluate(self, batch):
        hypotheses, references = zip(*batch)
        return self.bleurt.score(
            references=references, candidates=hypotheses, batch_size=len(batch)
        )

    def metadata(self):
        return {"model": self.MODEL_URL()}
