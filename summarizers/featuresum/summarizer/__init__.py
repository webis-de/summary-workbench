from .scores import Scorer

from model_setup import MODEL

class SummarizerPlugin:
    def __init__(self):
        self.model = Scorer(MODEL)

    def summarize(self, text, ratio, **kwargs):
        return self.model.summarize(document=text, ratio=ratio, **kwargs)
