from app.common.scorer import BleuScorer, CiderScorer, GreedyMatchingScorer, MeteorScorer, RougeScorer, MoverScoreScorer


class Metrics():
    def __init__(self):
        self.metrics = {
            'bleu': BleuScorer(),
            'cider': CiderScorer(),
            'greedy_matching': GreedyMatchingScorer(),
#             'meteor': MeteorScorer(),
            'rouge': RougeScorer(),
            'moverscore': MoverScoreScorer()
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
