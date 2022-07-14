import logging
import shutil
import tarfile
from pathlib import Path
from sys import stdout

import requests

CHECKPOINT_URL = (
    "https://files.webis.de/summarization-models/gsum/checkpoints/bart_sentence.pt"
)
DATA_URL = "https://files.webis.de/summarization-models/gsum/data.tar.gz"
SAVE_PATH = Path("~/checkpoints").expanduser()
DATA_PATH = Path("~/data").expanduser()


def _init_logger(name, log_level):
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.propagate = False
        logger.setLevel(log_level)
        handler = logging.StreamHandler(stdout)
        handler.setLevel(log_level)
        formatter = logging.Formatter(
            "%(asctime)s [%(name)s] %(levelname)s %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


def setup():
    logger = _init_logger("setup", "INFO")
    Path(SAVE_PATH).mkdir(parents=True, exist_ok=True)
    Path(DATA_PATH).mkdir(parents=True, exist_ok=True)

    logger.info("Downloading data ...")
    response_data = requests.get(DATA_URL, stream=True)
    with tarfile.open(fileobj=response_data.raw, mode="r|gz") as file:
        file.extractall(path=DATA_PATH)
    logger.info("Downloaded and extracted data.")

    logger.info("Downloading checkpoint ...")
    response_ckpt = requests.get(CHECKPOINT_URL, stream=True)
    with open(SAVE_PATH / "bart_sentence.pt", "wb") as file:
        shutil.copyfileobj(response_ckpt.raw, file)
        logger.info("Downloaded model checkpoint.")


if __name__ == "__main__":
    setup()
