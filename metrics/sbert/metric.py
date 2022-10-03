import os

from sentence_transformers import SentenceTransformer, util


def _paired_cosin_sim(embeddings1, embeddings2):
    assert len(embeddings1) == len(embeddings2)
    return [
        float(util.pytorch_cos_sim(e1, e2)[0][0])
        for e1, e2 in zip(embeddings1, embeddings2)
    ]


class MetricPlugin:
    MODEL = os.environ.get("model") or "roberta-large-nli-stsb-mean-tokens"

    def __init__(self):
        self.model = SentenceTransformer(self.MODEL)

    def _evaluate(self, hypotheses, references):
        embeddings1 = self.model.encode(hypotheses, convert_to_tensor=True)
        embeddings2 = self.model.encode(references, convert_to_tensor=True)
        cosine_scores = _paired_cosin_sim(embeddings1, embeddings2)
        return cosine_scores

    def evaluate(self, batch, references):
        return [self._evaluate(references, hypotheses) for hypotheses in batch]

    def metadata(self):
        return {"model": self.MODEL}
