from .cider import Cider


class MetricPlugin:
    def __init__(self):
        self.cider = Cider()

    def evaluate(self, batch):
        hypotheses, references = zip(*batch)
        return self.cider.compute_score(hypotheses, references, aggregate=False)
