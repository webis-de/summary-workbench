import os
from statistics import mean

import spacy

MODEL = os.environ["PLUGIN_MODEL"]


class MetricPlugin:
    def __init__(self):
        self.nlp = spacy.load(MODEL)

    def evaluate(self, hypotheses, references):
        nlp = self.nlp
        scores = [nlp(h).similarity(nlp(r)) for h, r in zip(hypotheses, references)]
        return mean(scores)
