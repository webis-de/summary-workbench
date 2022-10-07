import os

from sentence_transformers import SentenceTransformer, util


def _paired_cosine_sim(embeddings1, embeddings2):
    assert len(embeddings1) == len(embeddings2)
    return [
        float(util.pytorch_cos_sim(e1, e2)[0][0])
        for e1, e2 in zip(embeddings1, embeddings2)
    ]


class MetricPlugin:
    MODEL = os.environ.get("model") or "all-mpnet-base-v2"

    def __init__(self):
        self.model = SentenceTransformer(self.MODEL)

    def evaluate(self, batch):
        hypotheses, references = zip(*batch)
        embeddings1 = self.model.encode(hypotheses, convert_to_tensor=True)
        embeddings2 = self.model.encode(references, convert_to_tensor=True)
        cosine_scores = _paired_cosine_sim(embeddings1, embeddings2)
        return cosine_scores

    def metadata(self):
        return {"model": self.MODEL}
