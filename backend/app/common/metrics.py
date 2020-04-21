from .scorer import (BERTScorer, BLEUScorer, CIDErScorer, GreedyMatchingScorer,
                     METEORScorer, MoverScoreScorer, RougeScorer)


class Metrics:
    def __init__(self):
        self.metrics = {
            "bert": BERTScorer(),
            "bleu": BLEUScorer(),
            "cider": CIDErScorer(),
            "greedy_matching": GreedyMatchingScorer(),
            "meteor": METEORScorer(),
            "moverscore": MoverScoreScorer(),
            "rouge": RougeScorer(),
        }

    def compute(self, request_metrics, hyp_list, ref_list):
        request_metrics = set(request_metrics)
        available_metrics = set(self.metrics)

        unknown_metrics = request_metrics - available_metrics
        if not len(unknown_metrics) == 0:
            raise ValueError(unknown_metrics)

        scorable_metrics = available_metrics & request_metrics

        results = {}

        for metric in scorable_metrics:
            scorer = self.metrics[metric]
            results[metric] = scorer.score(hyp_list, ref_list)

        return results
