import os
from pathlib import Path
from urllib.parse import urljoin

import numpy as np
from gensim.models import KeyedVectors
from nltk.tokenize import word_tokenize
from sklearn.metrics.pairwise import cosine_similarity


class Embedding:
    def __init__(self, glove_bin_path):
        self.m = KeyedVectors.load(str(glove_bin_path), mmap="r")
        self.unk = self.m.vectors.mean(axis=0)

    def vec(self, key):
        try:
            return self.m.vectors[self.m.vocab[key].index]
        except KeyError:
            return self.unk


class MetricPlugin:
    MODEL_NAME = os.environ.get("model") or "glove.6B.300d"
    MODEL_ZIP = "glove.6B.zip"
    MODEL_BASE_PATH = Path("~/.cache/glove/").expanduser()
    MODEL_BASE_URL = "http://nlp.stanford.edu/data/"

    @classmethod
    def MODEL_PATH(cls):
        return cls.MODEL_BASE_PATH / (cls.MODEL_NAME + ".model.bin")

    @classmethod
    def MODEL_URL(cls):
        return urljoin(cls.MODEL_BASE_URL + "/", cls.MODEL_ZIP)

    def __init__(self):
        self.emb = Embedding(self.MODEL_PATH())

    def _evaluate(self, hypotheses, references):
        references = [references]

        def embedd(lines):
            emb_lines = []
            for line in lines:
                emb = [self.emb.vec(token) for token in word_tokenize(line)]
                emb_lines.append(emb)
            return emb_lines

        # transform words to embeddings for all hypothesis
        emb_hyps = embedd(hypotheses)

        # transform words to embeddings for all references
        emb_refs = [embedd(refsource) for refsource in references]

        scores = []
        for emb_refsource in emb_refs:
            score_source = []
            for emb_hyp, emb_ref in zip(emb_hyps, emb_refsource):
                simi_matrix = cosine_similarity(emb_hyp, emb_ref)
                dir1 = simi_matrix.max(axis=0).mean()
                dir2 = simi_matrix.max(axis=1).mean()
                score_source.append((dir1 + dir2) / 2)
            scores.append(score_source)

        return np.max(scores, axis=0)

    def evaluate(self, batch, references):
        return [self._evaluate(hypotheses, references) for hypotheses in batch]
