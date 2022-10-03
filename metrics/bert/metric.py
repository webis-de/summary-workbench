import os

from bert_score import BERTScorer

MODEL = os.environ.get("model") or "roberta-large-mnli"


class MetricPlugin:
    def __init__(self):
        self.bert = BERTScorer(model_type=MODEL, rescale_with_baseline=True, lang="en")

    def evaluate(self, batch, references):
        return [self.bert.score(hypotheses, references)[0] for hypotheses in batch]
