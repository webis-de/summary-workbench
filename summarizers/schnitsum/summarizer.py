from os import environ

from schnitsum import SchnitSum

MODEL = environ.get("model") or "BART"

MODELS = {
    "BART": "sobamchan/bart-large-scitldr",
    "BART-65-shrinked": "sobamchan/bart-large-scitldr-distilled-3-3",
    "BART-37-shrinked": "sobamchan/bart-large-scitldr-distilled-12-3",
}


class SummarizerPlugin:
    def __init__(self):
        model_key = MODELS[MODEL]
        self.model = SchnitSum(model_key)
        self.meta = {"model": model_key}

    def summarize(self, batch, ratio):
        return self.model(batch, batch_size=len(batch))

    def metadata(self):
        return self.meta
