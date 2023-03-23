import os

import spacy

MODEL = os.environ.get("model") or "en_core_web_lg"


class MetricPlugin:
    def __init__(self):
        self.nlp = spacy.load(MODEL)

    def _evaluate(self, hypotheses, references):
        nlp = self.nlp
        scores = [nlp(h).similarity(nlp(r)) for h, r in zip(hypotheses, references)]
        return scores

    def evaluate(self, batch):
        hypotheses, references = zip(*batch)
        return self._evaluate(hypotheses, references)

    def metadata(self):
        return {"model": MODEL}
