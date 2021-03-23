import os

from .moverscore import MoverScore, MoverScoreV2

MODELS = {"MoverScoreV1": MoverScore, "MoverScoreV2": MoverScoreV2}

MODEL = os.environ.get("PLUGIN_MODEL") or "MoverScoreV2"

MODEL_CLASS = MODELS[MODEL]


class MetricPlugin:
    def __init__(self):
        self.mover_score = MODEL_CLASS()

    def score(self, hypotheses, references):
        return {"moverscore": self.mover_score.score(references, hypotheses)}
