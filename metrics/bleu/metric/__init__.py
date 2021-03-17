from .bleu import Bleu


class MetricPlugin:
    def __init__(self):
        self.bleu = Bleu()

    def evaluate(self, hypotheses, references):
        return {"BLEU": self.bleu.compute_score(hypotheses, references)}
