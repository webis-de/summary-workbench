from .ModelProcessor import BertSummarizer as _BertSum


class BertSummarizer:
    MODEL = "distilbert-base-uncased"

    def __init__(self):
        self.bertsum = _BertSum(model=self.MODEL, reduce_option="max")

    def summarize(self, text, ratio):
        return self.bertsum(text, min_length=0, max_length=500, ratio=ratio)
