from .bleu import Bleu


class MetricPlugin:
    def __init__(self):
        self.bleu = Bleu()

    def evaluate(self, batch):
        hypotheses, references = zip(*batch)
        return self.bleu.compute_score(hypotheses, references, aggregate=False)
