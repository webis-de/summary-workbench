import os

from .ModelProcessor import BertSummarizer

MODEL = os.environ.get("model") or "distilbert-base-uncased"


class SummarizerPlugin:
    def __init__(self):
        self.bertsum = BertSummarizer(model=MODEL, reduce_option="max")

    def summarize(self, batch, ratio):
        return [
            self.bertsum(text, min_length=0, max_length=500, ratio=ratio)
            for text in batch
        ]
