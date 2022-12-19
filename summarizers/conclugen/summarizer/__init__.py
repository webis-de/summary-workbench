import os
from pathlib import Path

from .summarizer import ConcluGen

SAVE_DIR = Path("~/checkpoints").expanduser()


class SummarizerPlugin:
    def __init__(self):
        url = "https://files.webis.de/webis-conclugen21-models/dbart.tar.gz"
        path = SAVE_DIR / "dbart"
        self.meta = {"model": url}
        self.summarizer = ConcluGen(path, url)

    def summarize(self, batch, ratio, use_contrastive_search: bool = True):
        return [
            self.summarizer.summarize(
                text, ratio=ratio, use_contrastive_search=use_contrastive_search
            )
            for text in batch
        ]

    def metadata(self):
        return self.meta
