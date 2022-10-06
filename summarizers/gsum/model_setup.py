import logging
import shutil
import sys
import tarfile
from pathlib import Path

import requests

CHECKPOINT_URL = (
    "https://files.webis.de/summarization-models/gsum/checkpoints/bart_sentence.pt"
)
DATA_URL = "https://files.webis.de/summarization-models/gsum/data.tar.gz"
SAVE_PATH = Path("~/checkpoints").expanduser()
DATA_PATH = Path("~/data").expanduser()
BART_PATH = SAVE_PATH / "bart_sentence.pt"

CHECKPOINT_HASH_SUM = "1e30621a262b5818e78ae9775d0512ad"

import os
from hashlib import md5


def _gen_md5_hash(file):
    hasher = md5()
    with open(file, "rb") as f:
        start_bytes = f.read(1024)
        num_bytes = f.seek(0, os.SEEK_END)
        f.seek(-min(1024, num_bytes), os.SEEK_END)
        end_bytes = f.read()
        hasher.update(start_bytes)
        hasher.update(end_bytes)
        hasher.update(str(num_bytes).encode("utf-8"))
    return hasher.digest().hex()


def _init_logger(name, log_level):
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.propagate = False
        logger.setLevel(log_level)
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)
        formatter = logging.Formatter(
            "%(asctime)s [%(name)s] %(levelname)s %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


def setup():
    logger = _init_logger("setup", "INFO")

    if not DATA_PATH.exists():
        Path(DATA_PATH).mkdir(parents=True, exist_ok=True)
        logger.info("Downloading data ...")
        response_data = requests.get(DATA_URL, stream=True)
        with tarfile.open(fileobj=response_data.raw, mode="r|gz") as file:
            file.extractall(path=DATA_PATH)
        logger.info("Downloaded and extracted data.")

    if not BART_PATH.exists() or _gen_md5_hash(BART_PATH) != CHECKPOINT_HASH_SUM:
        Path(SAVE_PATH).mkdir(parents=True, exist_ok=True)
        logger.info("Downloading checkpoint ...")
        response_ckpt = requests.get(CHECKPOINT_URL, stream=True)
        with open(BART_PATH, "wb") as file:
            shutil.copyfileobj(response_ckpt.raw, file)
            logger.info("Downloaded model checkpoint.")
        if _gen_md5_hash(BART_PATH) != CHECKPOINT_HASH_SUM:
            logger.info(f"{BART_PATH} is corrupted")
            sys.exit(1)


if __name__ == "__main__":
    setup()
