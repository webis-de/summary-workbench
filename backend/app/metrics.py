import os

import numpy as np
from gensim.models import KeyedVectors
from nlgeval import Bleu, Cider, Meteor
from nltk.tokenize import word_tokenize
from rouge import Rouge
from sklearn.metrics.pairwise import cosine_similarity
from app.constants import data_path, glove_bin


class Embedding():
    def __init__(self):
        glove_path = os.path.join(data_path, glove_bin)
        self.m = KeyedVectors.load(glove_path, mmap='r')
        self.unk = self.m.vectors.mean(axis=0)

    def vec(self, key):
        try:
            return self.m.vectors[self.m.vocab[key].index]
        except KeyError:
            return self.unk


class Metrics():
    def __init__(self):
        self.emb = Embedding()
        self.rouge = Rouge()
        self.avail_metrics = {
            'rouge',
            'bleu',
            'meteor',
            'cider',
            'greedy_matching',
        }
        self.metric_scorers = {
            'bleu': Bleu(4),
            'meteor': Meteor(),
            'cider': Cider(),
        }

    def compute(self, metrics, hyp_list, ref_list):
        metrics = set(metrics)
        unknown_metrics = metrics - self.avail_metrics

        if unknown_metrics == {}:
            raise ValueError(unknown_metrics)

        scorable_metrics = set(self.metric_scorers.keys()) & metrics

        # nlgeval wants a list of a list of references
        # rouge only wants a single list of references
        ref_list_list = [ref_list]
        ref_list_zip = [[ref] for ref in ref_list]
        hyp_list_zip = [[hyp] for hyp in hyp_list]

        refs = dict(enumerate(ref_list_zip))
        hyps = dict(enumerate(hyp_list_zip))

        results = {}

        for metric in scorable_metrics:
            scorer = self.metric_scorers[metric]
            score = scorer.compute_score(refs, hyps)[0]
            if metric == "bleu":
                score = dict(zip(["Bleu_1", "Bleu_2", "Bleu_3", "Bleu_4"], score))
            results[metric] = score

        if 'rouge' in metrics:
            score = self.rouge.get_scores(hyp_list, ref_list, avg=True)
            results['rouge'] = score

        if 'greedy_matching' in metrics:
            score = self.greedy_matching(hyp_list, ref_list_list)
            results['greedy_matching'] = score

        return results

    def greedy_matching(self, hypothesis, references):
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
