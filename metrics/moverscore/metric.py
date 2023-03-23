import os

from moverscore import MoverScore

MODEL = os.environ.get("model") or "distilbert-base-uncased"


class MetricPlugin:
    def __init__(self):
        self.mover_score = MoverScore(model_name=MODEL)

    def evaluate(self, batch):
        hypotheses, references = zip(*batch)
        return self.mover_score.score(references, hypotheses)

    def metadata(self):
        return {"model": self.mover_score.model_name}
