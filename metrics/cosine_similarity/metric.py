import os

import spacy

MODEL = os.environ["model"]


class MetricPlugin:
    def __init__(self):
        self.nlp = spacy.load(MODEL)

    def evaluate(self, hypotheses, references):
        nlp = self.nlp
        scores = [nlp(h).similarity(nlp(r)) for h, r in zip(hypotheses, references)]
        return scores
