import nltk
from newspaper import nlp

from .textrank import TextRank


class TextRankSummarizer:
    def __init__(self):
        self.textrank = TextRank(weight_function="lexical_overlap")

    def summarize(self, text, ratio):
        return self.textrank.summarize(text=text, ratio=ratio * 0.5).strip()


class Newspaper3kSummarizer:
    def __init__(self):
        pass

    def summarize(self, text, ratio):
        num_sent = len(nlp.split_sentences(text))
        return " ".join(
            nlp.summarize(
                title=" ", text=text, max_sents=max(round(num_sent * ratio * 0.1), 1)
            )
        )


class Summarizers:
    def __init__(self):
        self.summarizers = {
            "newspaper3k": Newspaper3kSummarizer(),
            "textrank": TextRankSummarizer(),
        }

    def summarize(self, request_summarizers, text, ratio):
        request_summarizers = set(request_summarizers)
        available_summarizers = set(self.summarizers)

        unknown_summarizers = request_summarizers - available_summarizers
        if unknown_summarizers:
            raise ValueError(unknown_summarizers)

        scorable_summarizers = available_summarizers & request_summarizers

        results = {}

        for summarizer_name in scorable_summarizers:
            summarizer = self.summarizers[summarizer_name]
            summary = summarizer.summarize(text, ratio)
            summary = nltk.sent_tokenize(summary)
            results[summarizer_name] = summary

        return results
