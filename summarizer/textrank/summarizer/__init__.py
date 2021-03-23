from .textrank import TextRank


class SummarizerPlugin:
    def __init__(self):
        self.textrank = TextRank(weight_function="lexical_overlap")

    def summarize(self, text, ratio):
        return self.textrank.summarize(text=text, ratio=ratio * 0.5).strip()
