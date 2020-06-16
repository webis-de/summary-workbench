from .summarize import BertSummarizer, TextRankSummarizer, Newspaper3kSummarizer


class Summarizers(object):
    SUMMARIZERS = {
        "textrank": TextRankSummarizer,
        "bert": BertSummarizer,
        "newspaper3k": Newspaper3kSummarizer
    }
    def __init__(self):
        self.summarizers = {name: summarizer() for name, summarizer in self.SUMMARIZERS.items()}

    def summarize(self, summarizer, text):
        return self.summarizers[summarizer].summarize(text)
