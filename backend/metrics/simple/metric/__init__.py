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
        self.bleu = Bleu()

    def score(self, hypotheses, references):
        return {"BLEU": self.bleu.compute_score(hypotheses, references)}


class CIDErScorer:
    def __init__(self):
        self.cider = Cider()

    def score(self, hypotheses, references):
        return {"CIDEr": self.cider.compute_score(hypotheses, references)}


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
            results[metric] = scorer.score(hyp_list, ref_list)

        return results
