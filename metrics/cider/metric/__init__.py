from pathlib import Path

from .cider import Cider


class CIDErScorer:
    def __init__(self):
        self.cider = Cider()

    def score(self, hypotheses, references):
        return {"CIDEr": self.cider.compute_score(hypotheses, references)}
