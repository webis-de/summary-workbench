from scorer.bleuscorer import BleuScorer
from scorer.ciderscorer import CiderScorer
from scorer.greedymatchingscorer import GreedyMatchingScorer
from scorer.meteorscorer import MeteorScorer
from scorer.rougescorer import RougeScorer


class Metrics():
    def __init__(self):
        self.metrics = {
            'bleu': {
                'scorer': BleuScorer(),
                'readable': 'Bleu',
            },
            'cider': {
                'scorer': CiderScorer(),
                'readable': 'Cider',
            },
            'greedy_matching': {
                'scorer': GreedyMatchingScorer(),
                'readable': 'Greedy Matching',
            },
            'meteor': {
                'scorer': MeteorScorer(),
                'readable': 'Meteor'
            },
            'rouge': {
                'scorer': RougeScorer(),
                'readable': 'Rouge',
            }
        }

    @property
    def metrics_info(self):
        return sorted([(name, info["readable"])
                       for name, info in self.metrics.items()])

    def compute(self, request_metrics, hyp_list, ref_list):
        request_metrics = set(request_metrics)
        available_metrics = set(self.metrics)

        unknown_metrics = request_metrics - available_metrics
        if not unknown_metrics is {}:
            raise ValueError(unknown_metrics)

        scorable_metrics = available_metrics & request_metrics

        results = {}

        for metric in scorable_metrics:
            scorer = self.metrics[metric]["scorer"]
            results[metric] = scorer.score(hyp_list, ref_list)

        return results
