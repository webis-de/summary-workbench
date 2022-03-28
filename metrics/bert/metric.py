from bert_score import BERTScorer
import os

MODEL = os.environ.get("model") or "roberta-large-mnli"

class MetricPlugin:
    def __init__(self):
        self.bert = BERTScorer(model_type=MODEL, rescale_with_baseline=True, lang="en")

    def evaluate(self, hypotheses, references):
        return self.bert.score(hypotheses, references)[0]
