from pathlib import Path

from .cider import Cider


class MetricPlugin:
    def __init__(self):
        self.cider = Cider()

    def evaluate(self, hypotheses, references):
        return {"CIDEr": self.cider.compute_score(hypotheses, references)}