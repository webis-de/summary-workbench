from .textsum.summarizers import TextRank, BertSummarizer as BertSum
from newspaper import nlp

class TextRankSummarizer:
    def __init__(self):
        self.textrank = TextRank(weight_function="lexical_overlap")

    def summarize(self, text, ratio):
        return self.textrank.summarize(text=text, ratio=ratio).strip()

class BertSummarizer:
    def __init__(self):
        self.bertsum = BertSum(model='distilbert-base-uncased', reduce_option='max')

    def summarize(self, text, ratio):
        return self.bertsum(text, min_length=0, max_length=500, ratio=ratio)

class Newspaper3kSummarizer:
    def __init__(self):
        pass

    def summarize(self, text, ratio):
        return "\n".join(nlp.summarize(title=" ", text=text))
