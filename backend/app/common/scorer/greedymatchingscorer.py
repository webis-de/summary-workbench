import os

import numpy as np
from flask import current_app
from gensim.models import KeyedVectors
from nltk.tokenize import word_tokenize
from sklearn.metrics.pairwise import cosine_similarity

from . import Scorer


class Embedding():
    def __init__(self):
        data_path = current_app.config["DATA_PATH"]
        glove_bin = current_app.config["GLOVE_BIN"]
        glove_path = os.path.join(data_path, glove_bin)
        self.m = KeyedVectors.load(glove_path, mmap='r')
        self.unk = self.m.vectors.mean(axis=0)

    def vec(self, key):
        try:
            return self.m.vectors[self.m.vocab[key].index]
        except KeyError:
            return self.unk


class GreedyMatchingScorer(Scorer):
    def __init__(self):
        self.emb = Embedding()

    def score(self, hypothesis, references):
        references = [references]

        def embedd(lines):
            emb_lines = []
            for line in lines:
                emb = [self.emb.vec(token) for token in word_tokenize(line)]
                emb_lines.append(emb)
            return emb_lines

        # transform words to embeddings for all hypothesis
        emb_hyps = embedd(hypothesis)

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
        scores = np.max(scores, axis=0).mean()

        return scores
