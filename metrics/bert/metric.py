from bert_score import BERTScorer as Bert
import numpy as np
import os

MODEL = os.environ.get("PLUGIN_MODEL") or "roberta-large-mnli"

class MetricPlugin:
    def __init__(self):
        self.bert = Bert(model_type=MODEL)

    def evaluate(self, hypotheses, references):
        return {"bert": float(np.average(self.bert.score(hypotheses, references)[0], rescale_with_baseline=True, lang="en"))}
