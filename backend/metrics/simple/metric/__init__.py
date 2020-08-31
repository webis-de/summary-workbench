from pathlib import Path

from rouge import Rouge

from .bleu.bleu import Bleu
from .cider.cider import Cider


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


class Metrics:
    def __init__(self):
        self.metrics = {
            "bleu": BLEUScorer(),
            "cider": CIDErScorer(),
            "rouge": RougeScorer(),
        }

    def compute(self, request_metrics, hyp_list, ref_list):
        request_metrics = set(request_metrics)
        available_metrics = set(self.metrics)

        unknown_metrics = request_metrics - available_metrics
        if unknown_metrics:
            raise ValueError(unknown_metrics)

        scorable_metrics = available_metrics & request_metrics

        results = {}

        for metric in scorable_metrics:
            scorer = self.metrics[metric]
            results.update(scorer.score(hyp_list, ref_list))

        return results
