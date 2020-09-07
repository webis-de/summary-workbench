from bert_score import BERTScorer as Bert
import numpy as np

class BERTScorer:
    MODEL = "roberta-large-mnli"

    def __init__(self):
        self.bert = Bert(model_type=self.MODEL)

    def score(self, hypotheses, references):
        return {"bert": float(np.average(self.bert.score(hypotheses, references)[0]))}
