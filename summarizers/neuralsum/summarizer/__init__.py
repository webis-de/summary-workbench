import os

from .summarizer import NeuralSummarizer


class SummarizerPlugin:
    def __init__(self, *, model=None):
        self.model = model or os.environ["model"]
        self.summarizer = NeuralSummarizer(self.model)

    def summarize(self, batch, ratio, use_contrastive_search: bool = True):
        return [
            self.summarizer.summarize(
                text, ratio=ratio, use_contrastive_search=use_contrastive_search
            )
            for text in batch
        ]

    def metadata(self):
        return self.summarizer.metadata
