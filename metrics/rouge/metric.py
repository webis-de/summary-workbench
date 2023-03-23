from os import environ

from rouge import Rouge

model = environ["model"]

AVAILABLE_MODELS = {"1", "2", "l"}
if model not in AVAILABLE_MODELS:
    raise ValueError(f"invalid model {model}, needs to be one of {AVAILABLE_MODELS}")


class MetricPlugin:
    def __init__(self):
        self.rouge = Rouge()
        self.key = f"rouge-{model}"

    def evaluate(self, batch):
        hypotheses, references = zip(*batch)
        scores = self.rouge.get_scores(hypotheses, references, avg=False)
        return [score[self.key]["f"] for score in scores]

    def metadata(self):
        return {"model": model}
