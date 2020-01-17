from rouge import Rouge

from . import Scorer


class RougeScorer(Scorer):
    def __init__(self):
        self.rouge = Rouge()

    def score(self, hypothesis, references):
        return self.rouge.get_scores(hypothesis, references, avg=True)
