import asyncio
import logging
from os import environ

import aiohttp

summ_eval_metrics = {
    "bert": "bert_score",
    "bleu": "bleu",
    "cider": "cider",
    "meteor": "meteor",
    "moverscore": "mover_score",
    "rouge": "rouge",
}

score_converters = {
    "bert_score": lambda metrics: {"bert": {"bert": metrics["bert_score_f1"]}},
    "bleu": lambda metrics: {"bleu": {"bleu": metrics["bleu"]}},
    "cider": lambda metrics: {"cider": {"cider": metrics["cider"]}},
    "meteor": lambda metrics: {"meteor": {"meteor": metrics["meteor"]}},
    "mover_score": lambda metrics: {
        "moverscore": {"moverscore": metrics["mover_score"]}
    },
    "rouge": lambda metrics: {
        "rouge": {
            "rouge_1": metrics["rouge"]["rouge_1_f_score"],
            "rouge_2": metrics["rouge"]["rouge_2_f_score"],
            "rouge_l": metrics["rouge"]["rouge_l_f_score"],
        }
    },
}


def extract_scores(metrics, scores):
    extracted = {}
    for metric in metrics:
        extracted.update(score_converters[metric](scores))
    return extracted


class SingleMetric:
    def __init__(self, url):
        self.url = url

    async def request_score(self, session, hyps, refs):
        async with session.post(
            self.url, json={"hyps": hyps, "refs": refs}
        ) as response:
            return await response.json()


class MultipleMetrics:
    def __init__(self, metrics, url):
        self.metrics = list(metrics)
        self.url = url

    async def request_scores(self, session, metrics, hyps, refs):
        async with session.post(
            self.url, json={"metrics": list(metrics), "hyps": hyps, "refs": refs}
        ) as response:
            return await response.json()


class Metrics:
    SINGLE_METRICS = {
        "bert": "BERT_URL",
        "greedy_matching": "GREEDY_MATCHING_URL",
        "meteor": "METEOR_URL",
        "moverscore": "MOVER_SCORE_URL",
        "bleurt": "BLEURT_URL",
    }
    MULTIPLE_METRICS = {"bleu", "cider", "rouge"}

    def __init__(self):
        self.single_metrics = {
            metric: SingleMetric(environ[url])
            for metric, url in self.SINGLE_METRICS.items()
        }
        self.multiple_metrics = MultipleMetrics(
            self.MULTIPLE_METRICS, environ["SIMPLE_METRICS_URL"]
        )
        self.summ_eval_url = environ["SUMM_EVAL_URL"]

    async def summ_eval_request(self, metrics, hyps, refs, session):
        async with session.post(
            self.summ_eval_url, json={"metrics": metrics, "hyps": hyps, "refs": refs}
        ) as response:
            return await response.json()

    @classmethod
    def METRICS(cls):
        return cls.MULTIPLE_METRICS | set(cls.SINGLE_METRICS.keys())

    async def _retrieve(
        self,
        requested_single_metrics,
        requested_multiple_metrics,
        hyps,
        refs,
        compute_summ_eval=False,
    ):
        metric_requests = []
        async with aiohttp.ClientSession() as session:
            for metric in requested_single_metrics:
                metric_requests.append(
                    self.single_metrics[metric].request_score(session, hyps, refs)
                )

            if requested_multiple_metrics:
                metric_requests.append(
                    self.multiple_metrics.request_scores(
                        session, requested_multiple_metrics, hyps, refs
                    )
                )

            final_scores = {}
            gather_metric_requests = asyncio.gather(*metric_requests)
            if compute_summ_eval:
                used_summ_eval_metrics = [
                    summ_eval_metrics[metric]
                    for metric in requested_single_metrics | requested_multiple_metrics
                    if metric in summ_eval_metrics
                ]
                scores, summ_eval_scores = await asyncio.gather(
                    gather_metric_requests,
                    self.summ_eval_request(used_summ_eval_metrics, hyps, refs, session),
                )
                logging.warning(summ_eval_scores)
                summ_eval_scores = extract_scores(
                    used_summ_eval_metrics, summ_eval_scores
                )
            else:
                scores = await gather_metric_requests

            for score in scores:
                final_scores.update(score)

            if compute_summ_eval:
                return final_scores, summ_eval_scores
            else:
                return final_scores

    def compute(self, request_metrics, hyps, refs, compute_summ_eval=False):
        request_metrics = set(request_metrics)

        available_single_metrics = set(self.single_metrics)
        available_multiple_metrics = set(self.multiple_metrics.metrics)

        unknown_metrics = request_metrics - (
            available_single_metrics | available_multiple_metrics
        )
        if unknown_metrics:
            raise ValueError(unknown_metrics)

        requested_single_metrics = available_single_metrics & request_metrics
        requested_multiple_metrics = available_multiple_metrics & request_metrics
        return asyncio.run(
            self._retrieve(
                requested_single_metrics,
                requested_multiple_metrics,
                hyps,
                refs,
                compute_summ_eval=compute_summ_eval,
            )
        )
