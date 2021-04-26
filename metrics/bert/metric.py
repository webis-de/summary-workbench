from bert_score import BERTScorer
import numpy as np
import os

MODEL = os.environ.get("PLUGIN_MODEL") or "roberta-large-mnli"

class MetricPlugin:
    def __init__(self):
        self.bert = BERTScorer(model_type=MODEL, rescale_with_baseline=True, lang="en")

    def evaluate(self, hypotheses, references):
        return float(np.average(self.bert.score(hypotheses, references)[0]))
