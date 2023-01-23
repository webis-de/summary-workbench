import contextlib
import logging
import os
import pathlib
import sys
from hashlib import md5

import requests
from tqdm.auto import tqdm

logging.basicConfig(level=logging.INFO)

# checkpoints for LoBART_ORC models
URL_PODCAST_MODEL = "https://files.webis.de/summarization-models/longsum/podcasts/podcast_LoBART4k_ORC.pt"
CHECKPOINT_NAME = URL_PODCAST_MODEL.split("/")[-1]
SAVE_PATH = pathlib.Path("~/checkpoints").expanduser()
MODEL_PATH = SAVE_PATH / CHECKPOINT_NAME
MODEL_NAME = "LoBART"

CHECKPOINT_HASH_SUM = "a76d232ea23ad22adc9d00210ea9302f"


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


@contextlib.contextmanager
def progress_open(path, *args, total=0, **kwargs):
    with open(path, *args, **kwargs) as outf:
        with tqdm.wrapattr(
            outf,
            "write",
            miniters=1,
            total=total,
            desc=path.name,
        ) as tqdm_file:
            yield tqdm_file


def setup():
    logger = _init_logger("setup", "INFO")
    SAVE_PATH.mkdir(parents=True, exist_ok=True)
    if not MODEL_PATH.exists() or _gen_md5_hash(MODEL_PATH) != CHECKPOINT_HASH_SUM:
        logger.info("Checkpoint not present")
        logger.info("Downloading checkpoint")
        with requests.get(URL_PODCAST_MODEL, stream=True) as response:
            with progress_open(
                MODEL_PATH, "wb", total=int(response.headers.get("content-length", 0))
            ) as f:
                for chunk in response.iter_content(chunk_size=4096):
                    f.write(chunk)
        if _gen_md5_hash(MODEL_PATH) != CHECKPOINT_HASH_SUM:
            logger.info(f"{MODEL_PATH} is corrupted")
            sys.exit(1)
        logger.info("Done")
    else:
        logger.info("Checkpoint exists")


if __name__ == "__main__":
    setup()
