import os

import numpy as np
from flask import current_app
from nltk.tokenize import word_tokenize
from rouge import Rouge
from sklearn.metrics.pairwise import cosine_similarity

from app.common.moverscore import get_idf_dict, word_mover_score
from gensim.models import KeyedVectors
from app.common.nlgeval import Bleu, Cider, Meteor


class RougeScorer():
    def __init__(self):
        self.rouge = Rouge()

    def score(self, hypotheses, references):
        return self.rouge.get_scores(hypotheses, references, avg=True)


class BleuScorer():
    def __init__(self):
        self.bleu = Bleu(4)

    def score(self, hypotheses, references):
        hyp_list_zip = [[hyp] for hyp in hypotheses]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        score = self.bleu.compute_score(refs, hyps)[0]
        return dict(zip(["Bleu_1", "Bleu_2", "Bleu_3", "Bleu_4"], score))


class CiderScorer():
    def __init__(self):
        self.cider = Cider()

    def score(self, hypotheses, references):
        hyp_list_zip = [[hyp] for hyp in hypotheses]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        return self.cider.compute_score(refs, hyps)[0]


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


class GreedyMatchingScorer():
    def __init__(self):
        self.emb = Embedding()

    def score(self, hypotheses, references):
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
        scores = np.max(scores, axis=0).mean()

        return scores


class MeteorScorer():
    def __init__(self):
        self.meteor = Meteor()

    def score(self, hypotheses, references):
        hyp_list_zip = [[hyp] for hyp in hypotheses]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        return self.meteor.compute_score(refs, hyps)[0]


class MoverScoreScorer():
    def __init__(self):
        pass

    def score(self, hypotheses, references):
        idf_dict_hyp = get_idf_dict(hypotheses)
        idf_dict_ref = get_idf_dict(references)

        return word_mover_score(references,
                                hypotheses,
                                idf_dict_ref,
                                idf_dict_hyp,
                                stop_words=[],
                                n_gram=1,
                                remove_subwords=True)
