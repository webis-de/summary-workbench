import aiohttp
import asyncio
from os import environ
import logging


class SingleMetric():
    def __init__(self, url):
        self.url = url

    async def request_score(self, session, hyps, refs):
        async with session.post(self.url, json={"hyps": hyps, "refs": refs}) as response:
            return await response.json()

class MultipleMetrics:
    def __init__(self, metrics, url):
        self.metrics = list(metrics)
        self.url = url

    async def request_scores(self, session, metrics, hyps, refs):
        async with session.post(self.url, json={"metrics": list(metrics), "hyps": hyps, "refs": refs}) as response:
            return await response.json()

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

    async def _retrieve(self, requested_single_metrics, requested_multiple_metrics, hyps, refs):
        _requests = []
        async with aiohttp.ClientSession() as session:
            for metric in requested_single_metrics:
                _requests.append(self.single_metrics[metric].request_score(session, hyps, refs))

            if requested_multiple_metrics:
                _requests.append(self.multiple_metrics.request_scores(session, requested_multiple_metrics, hyps, refs))

            logging.warning(_requests)
            scores = {}
            for score in await asyncio.gather(*_requests):
                scores.update(score)
            return scores

    def compute(self, request_metrics, hyps, refs):
        request_metrics = set(request_metrics)

        available_single_metrics = set(self.single_metrics)
        available_multiple_metrics = set(self.multiple_metrics.metrics)

        unknown_metrics = request_metrics - (available_single_metrics | available_multiple_metrics)
        if unknown_metrics:
            raise ValueError(unknown_metrics)

        requested_single_metrics = available_single_metrics & request_metrics
        requested_multiple_metrics = available_multiple_metrics & request_metrics
        return asyncio.run(self._retrieve(requested_single_metrics, requested_multiple_metrics, hyps, refs))
