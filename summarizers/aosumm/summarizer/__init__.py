from pydantic import Field

from .summarizer import Generator

MODEL = "hyunwoongko/ctrlsum-cnndm"


class SummarizerPlugin:
    def __init__(self):
        self.model = Generator(MODEL)
        self.meta = {"model": self.model.model_name}

    def summarize(
        self,
        batch,
        ratio,
        keywords: str = Field(..., min_length=1),
        use_contrastive_search: bool = True,
    ):
        return [
            self.model.summarize(
                text,
                keywords,
                ratio=ratio,
                use_contrastive_search=use_contrastive_search,
            )
            for text in batch
        ]

    def metadata(self):
        return self.meta
