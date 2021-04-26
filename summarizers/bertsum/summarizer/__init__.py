import os

from .ModelProcessor import BertSummarizer

MODEL = os.environ.get("PLUGIN_MODEL") or "distilbert-base-uncased"


class SummarizerPlugin:
    def __init__(self):
        self.bertsum = BertSummarizer(model=MODEL, reduce_option="max")

    def summarize(self, text, ratio):
        return self.bertsum(text, min_length=0, max_length=500, ratio=ratio)
