from textsum import TextRank, BertSummarizer as BertSum

class TextRankSummarizer:
    def __init__(self):
        self.textrank = TextRank(weight_function="lexical_overlap")

    def summarize(self, text):
        return self.textrank.summarize(text=text).strip()

class BertSummarizer:
    def __init__(self):
        self.bertsum = BertSum(model='distilbert-base-uncased', reduce_option='max')

    def summarize(self, text):
        return self.bertsum(text, min_length=0, max_length=500, ratio=0.18)
