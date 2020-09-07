import grequests
from os import environ
import logging

class SingleMetric():
    def __init__(self, url):
        self.url = url

    def request_score(self, hyps, refs):
        return grequests.post(self.url, json={"hyps": hyps, "refs": refs})

class MultipleMetrics:
    def __init__(self, metrics, url):
        self.metrics = list(metrics)
        self.url = url

    def request_scores(self, metrics, hyps, refs):
        return grequests.post(self.url, json={"metrics": list(metrics), "hyps": hyps, "refs": refs})

class Metrics:
    SINGLE_METRICS = {
        "bert": "BERT_URL",
        "greedy_matching": "GREEDY_MATCHING_URL",
        "meteor": "METEOR_URL",
        "moverscore": "MOVER_SCORE_URL",
        "bleurt": "BLEURT_URL",
    }
    MULTIPLE_METRICS = {
        "bleu",
        "cider",
        "rouge"
    }

    def __init__(self):
        self.single_metrics = {metric: SingleMetric(environ[url]) for metric, url in self.SINGLE_METRICS.items()}
        self.multiple_metrics = MultipleMetrics(self.MULTIPLE_METRICS, environ["SIMPLE_METRICS_URL"])

    @classmethod
    def METRICS(cls):
        return cls.MULTIPLE_METRICS | set(cls.SINGLE_METRICS.keys())

    def compute(self, request_metrics, hyps, refs):
        request_metrics = set(request_metrics)

        available_single_metrics = set(self.single_metrics)
        available_multiple_metrics = set(self.multiple_metrics.metrics)

        unknown_metrics = request_metrics - (available_single_metrics | available_multiple_metrics)
        if unknown_metrics:
            raise ValueError(unknown_metrics)

        requested_single_metrics = available_single_metrics & request_metrics
        requested_multiple_metrics = available_multiple_metrics & request_metrics

        _requests = []

        for metric in requested_single_metrics:
            _request = self.single_metrics[metric].request_score(hyps, refs)
            _requests.append(_request)

        if requested_multiple_metrics:
            _requests.append(self.multiple_metrics.request_scores(requested_multiple_metrics, hyps, refs))

        scores = {}
        for response in grequests.map(_requests, exception_handler=lambda _, y: logging.warning(y)):
            if response is None:
                raise ValueError("Some request didn't work, maybe the endpoint is not available")
            scores.update(response.json())
        return scores
