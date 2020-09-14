import asyncio
import logging
from os import environ

import aiohttp


async def gather(tasks):
    return await asyncio.gather(*tasks)


def get_all(_requests):
    return asyncio.run(gather(_requests))


class SingleSummarizer:
    def __init__(self, url):
        self.url = url

    async def request_summary(self, session, text, ratio):
        async with session.post(
            self.url, json={"text": text, "ratio": ratio}
        ) as response:
            return await response.json()


class MultipleSummarizers:
    def __init__(self, summarizers, url):
        self.summarizers = list(summarizers)
        self.url = url

    async def request_summaries(self, session, summarizers, text, ratio):
        async with session.post(
            self.url,
            json={"summarizers": list(summarizers), "text": text, "ratio": ratio},
        ) as response:
            return await response.json()


class Summarizers(object):
    SINGLE_SUMMARIZERS = {"bertsum": "BERTSUM_URL"}
    MULTIPLE_SUMMARIZERS = {"textrank", "newspaper3k"}

    @classmethod
    def SUMMARIZERS(cls):
        return cls.MULTIPLE_SUMMARIZERS | set(cls.SINGLE_SUMMARIZERS.keys())

    def __init__(self):
        self.single_summarizers = {
            summarizer: SingleSummarizer(environ[url])
            for summarizer, url in self.SINGLE_SUMMARIZERS.items()
        }
        self.multiple_summarizers = MultipleSummarizers(
            self.MULTIPLE_SUMMARIZERS, environ["SIMPLE_SUMMARIZERS_URL"]
        )

    async def _retrieve(
        self, requested_single_summarizers, requested_multiple_summarizers, text, ratio
    ):
        _requests = []
        async with aiohttp.ClientSession() as session:
            for metric in requested_single_summarizers:
                _requests.append(self.single_summarizers[metric].request_summary(
                        session, text, ratio
                    )
                )

            if requested_multiple_summarizers:
                _requests.append(self.multiple_summarizers.request_summaries(
                        session, requested_multiple_summarizers, text, ratio
                    )
                )

            summaries = {}
            for summarie in await asyncio.gather(*_requests):
                summaries.update(summarie)
            return summaries

    def summarize(self, request_summarizers, text, ratio=0.2):
        request_summarizers = set(request_summarizers)

        available_single_summarizers = set(self.single_summarizers)
        available_multiple_summarizers = set(self.multiple_summarizers.summarizers)

        unknown_summarizers = request_summarizers - (
            available_single_summarizers | available_multiple_summarizers
        )
        if unknown_summarizers:
            raise ValueError(unknown_summarizers)

        requested_single_summarizers = (
            available_single_summarizers & request_summarizers
        )
        requested_multiple_summarizers = (
            available_multiple_summarizers & request_summarizers
        )

        a = asyncio.run(
            self._retrieve(
                requested_single_summarizers,
                requested_multiple_summarizers,
                text,
                ratio,
            )
        )
        return a
