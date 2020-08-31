import grequests
from os import environ

class SingleMetric():
    def __init__(self, url):
        self.url = url

    def request_score(self, hyps, refs):
        return grequests.post(self.url, json={"hyps": hyps, "refs": refs})

class MultipleMetrics:
    def __init__(self, metrics, url):
        self.metrics = list(metrics)
        self.url = url

    def request_scores(self, hyps, refs):
        return grequests.post(self.url, json={"metrics": self.metrics, "hyps": hyps, "refs": refs})

class Metrics:
    def __init__(self):
        self.single_metrics = {
            "bert": SingleMetric(environ["BERT_URL"]),
            "greedy_matching": SingleMetric(environ["GREEDY_MATCHING_URL"]),
            "meteor": SingleMetric(environ["METEOR_URL"]),
            "moverscore": SingleMetric(environ["MOVER_SCORE_URL"]),
            "bleurt": SingleMetric(environ["BLEURT_URL"]),
        }
        self.multiple_metrics = MultipleMetrics({
            "bleu",
            "cider",
            "rouge"
        }, environ["SIMPLE_METRICS_URL"])

    def compute(self, request_metrics, hyp_list, ref_list):
        request_metrics = set(request_metrics)

        available_singel_metrics = set(self.single_metrics)
        available_multiple_metrics = set(self.multiple_metrics.metrics)

        unknown_metrics = request_metrics - (available_singel_metrics | available_multiple_metrics)
        if unknown_metrics:
            raise ValueError(unknown_metrics)

        requested_single_metrics = available_singel_metrics & request_metrics
        requested_multiple_metrics = available_multiple_metrics & request_metrics

        _requests = []

        for metric in requested_single_metrics:
            _request = self.single_metrics[metric].request_score(hyp_list, ref_list)
            _requests.append(_request)

        return [response.json() for response in grequests.map(_requests)]
