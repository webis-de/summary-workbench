# pylint: disable=C0103
import re
from .cider_scorer import CiderScorer

tokenizer = re.compile(r'\w+')

def tokenize(document):
    return tokenizer.findall(document)

class Cider():
    def __init__(self, n_gram=4, sigma=6.0, tokenize=True):
        """
        CIDEr metric
        Makes use of https://github.com/Maluuba/nlg-eval/tree/master/nlgeval/pycocoevalcap/cider

        Args:
                :param n_gram: CIDEr calculation takes into account n_grams of up to this length
                :param sigma: sigma used in Gaussian length penalty, described in Section 8 of original paper
                :param tokenize: whether to apply basic tokenization to input; otherwise assumes that user has \
                        done any necessary tokenization

        """
        self.n_gram = n_gram
        self.sigma = sigma
        self.tokenize = tokenize

    def compute_score(self, summaries, references, aggregate=True):
        if isinstance(summaries, str):
            summaries = [summaries]
        if isinstance(references, str):
            references = [references]
        if self.tokenize:
            if isinstance(references[0], str):
                references = [" ".join(tokenize(reference)) \
                              for reference in references]
            else:
                references = [[" ".join(tokenize(ref)) \
                              for ref in reference] for reference in references]
            summaries = [" ".join(tokenize(summary)) for summary in summaries]
        cider_scorer = CiderScorer(n=self.n_gram, sigma=self.sigma)
        for summ, ref in zip(summaries, references):
            if not isinstance(ref, list):
                ref = [ref]
            cider_scorer += (summ, ref)
        score, scores = cider_scorer.compute_score()
        if not aggregate:
            return score
        return score
