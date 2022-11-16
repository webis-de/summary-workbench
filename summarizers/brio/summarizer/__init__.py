from os import environ

from .summarizer import Generator

MODELS = {
    "CNNDM-uncased": "Yale-LILY/brio-cnndm-uncased",
    "CNNDM-cased": "Yale-LILY/brio-cnndm-cased",
    "XSUM-cased": "Yale-LILY/brio-xsum-cased",
}


class SummarizerPlugin:
    def __init__(self, model=None):
        model = model or environ["model"]
        self.model = Generator(MODELS[model])
        self.meta = {"model": self.model.model_name}

    def summarize(self, batch, ratio):
        return [self.model.summarize(text, ratio) for text in batch]

    def summarize(
        self,
        batch,
        ratio,
        use_contrastive_search: bool = True,
    ):
        return [
            self.model.summarize(
                text,
                ratio=ratio,
                use_contrastive_search=use_contrastive_search,
            )
            for text in batch
        ]

    def metadata(self):
        return self.meta
