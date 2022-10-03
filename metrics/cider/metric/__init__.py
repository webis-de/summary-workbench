from .cider import Cider


class MetricPlugin:
    def __init__(self):
        self.cider = Cider()

    def evaluate(self, batch, references):
        return [self.cider.compute_score(hypotheses, references, aggregate=False) for hypotheses in batch]
