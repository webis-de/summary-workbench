import grequests
from os import environ
import logging

class SingleSummarizer():
    def __init__(self, url):
        self.url = url

    def request_summary(self, text, ratio):
        return grequests.post(self.url, json={"text": text, "ratio": ratio})

class MultipleSummarizers:
    def __init__(self, summarizers, url):
        self.summarizers = list(summarizers)
        self.url = url

    def request_summaries(self, summarizers, text, ratio):
        return grequests.post(self.url, json={"summarizers": list(summarizers), "text": text, "ratio": ratio})

class Summarizers(object):
    SINGLE_SUMMARIZERS = {
        "bertsum": "BERTSUM_URL"
    }
    MULTIPLE_SUMMARIZERS = {
        "textrank",
        "newspaper3k"
    }

    @classmethod
    def SUMMARIZERS(cls):
        return cls.MULTIPLE_SUMMARIZERS | set(cls.SINGLE_SUMMARIZERS.keys())

    def __init__(self):
        self.single_summarizers = {summarizer: SingleSummarizer(environ[url]) for summarizer, url in self.SINGLE_SUMMARIZERS.items()}
        self.multiple_summarizers = MultipleSummarizers(self.MULTIPLE_SUMMARIZERS, environ["SIMPLE_SUMMARIZERS_URL"])

    def summarize(self, request_summarizers, text, ratio=0.2):
        request_summarizers = set(request_summarizers)

        available_single_summarizers = set(self.single_summarizers)
        available_multiple_summarizers = set(self.multiple_summarizers.summarizers)

        unknown_summarizers = request_summarizers - (available_single_summarizers | available_multiple_summarizers)
        if unknown_summarizers:
            raise ValueError(unknown_summarizers)

        requested_single_summarizers = available_single_summarizers & request_summarizers
        requested_multiple_summarizers = available_multiple_summarizers & request_summarizers

        _requests = []

        for metric in requested_single_summarizers:
            _requests.append(self.single_summarizers[metric].request_summary(text, ratio))

        if requested_multiple_summarizers:
            _requests.append(self.multiple_summarizers.request_summaries(requested_multiple_summarizers, text, ratio))

        summaries = {}
        for response in grequests.map(_requests, exception_handler=lambda _, y: logging.warning(y)):
            if response is None:
                raise ValueError("Some request didn't work, maybe the endpoint is not available")
            summaries.update(response.json())
        return summaries
