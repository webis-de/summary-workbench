from os import path

import numpy as np
from bert_score import BERTScorer as Bert
from gensim.models import KeyedVectors
from nltk.tokenize import word_tokenize
from rouge import Rouge
from sklearn.metrics.pairwise import cosine_similarity

from .moverscore import MoverScore
from .nlgeval import Bleu, Cider, Meteor


class RougeScorer:
    def __init__(self):
        self.rouge = Rouge()

    def score(self, hypotheses, references):
        scores = self.rouge.get_scores(hypotheses, references, avg=True)
        return {score.replace("-", " "): info["f"] for score, info in scores.items()}


class BLEUScorer:
    def __init__(self):
        self.bleu = Bleu(4)

    def score(self, hypotheses, references):
        hyp_list_zip = [[hyp] for hyp in hypotheses]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        score = self.bleu.compute_score(refs, hyps)[0]
        return dict(zip(["BLEU 1", "BLEU 2", "BLEU 3", "BLEU 4"], score))


class CIDErScorer:
    def __init__(self):
        self.cider = Cider()

    def score(self, hypotheses, references):
        hyp_list_zip = [[hyp] for hyp in hypotheses]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        return {"CIDEr": self.cider.compute_score(refs, hyps)[0]}


class Embedding:
    def __init__(self):
        glove_bin = path.expanduser("~/.cache/glove/glove.6B.300d.model.bin")
        self.m = KeyedVectors.load(glove_bin, mmap="r")
        self.unk = self.m.vectors.mean(axis=0)

    def vec(self, key):
        try:
            return self.m.vectors[self.m.vocab[key].index]
        except KeyError:
            return self.unk


class GreedyMatchingScorer:
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

        return {"greedy matching": scores}


class METEORScorer:
    def __init__(self):
        self.meteor = Meteor()

    def score(self, hypotheses, references):
        hyp_list_zip = [[hyp] for hyp in hypotheses]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        return {"METEOR": self.meteor.compute_score(refs, hyps)[0]}


class BERTScorer:
    def __init__(self):
        self.bert = Bert(model_type="roberta-large-mnli")

    def score(self, hypotheses, references):
        score = self.bert.score(hypotheses, references)
        score = float(np.average(score[0]))
        return {"BERT": score}


class MoverScoreScorer:
    def __init__(self):
        self.mover_score = MoverScore()

    def score(self, hypotheses, references):
        score = self.mover_score.score(hypotheses, references)
        return {"MoverScore": score}
