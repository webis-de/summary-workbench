import os
from pathlib import Path

from .summarizer import CliffSum

SAVE_DIR = Path("~/checkpoints").expanduser()

MODELS = {
    "MaskEnt": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/maskent.tar.gz",
        "path": SAVE_DIR / "maskent",
    },
    "MaskRel": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/maskrel.tar.gz",
        "path": SAVE_DIR / "maskrel",
    },
    "RegenEnt": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/regenent.tar.gz",
        "path": SAVE_DIR / "regenent",
    },
    "RegenRel": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/regenrel.tar.gz",
        "path": SAVE_DIR / "regenrel",
    },
    "SwapEnt": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/swapent.tar.gz",
        "path": SAVE_DIR / "swapent",
    },
    "SysLowCon": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/syslowcon.tar.gz",
        "path": SAVE_DIR / "syslowcon",
    },
}


class SummarizerPlugin:
    def __init__(self, model=None):
        model = model or os.environ["model"]
        model_data = MODELS[model]
        url = model_data["url"]
        path = model_data["path"]
        self.meta = {"model": url}
        self.summarizer = CliffSum(path, url)

    def summarize(self, batch, ratio, use_contrastive_search: bool = True):
        return [
            self.summarizer.summarize(
                text, ratio=ratio, use_contrastive_search=use_contrastive_search
            )
            for text in batch
        ]

    def metadata(self):
        return self.meta
