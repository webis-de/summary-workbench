import inspect
import json
import logging
from hashlib import md5
from math import ceil
from pathlib import Path
from zipfile import ZipFile

import requests

from metric import BLEURTScorer


def download_file(url, save_path, logger=None):
    chunk_size = 20 * 1024 ** 2

    Path(save_path).parent.mkdir(exist_ok=True, parents=True)
    req = requests.get(url, stream=True)
    req.raise_for_status()

    length = req.headers.get("Content-length")
    total = ceil(int(length) / chunk_size) if length is not None else None
    chunks = req.iter_content(chunk_size=chunk_size)

    with open(save_path, "wb") as file:
        for i, chunk in enumerate(chunks, start=1):
            file.write(chunk)
            if logger is not None:
                logger.info(f"{i}/{total}")


def _gen_md5_hash(files):
    hasher = md5()
    for file in sorted(files):
        with open(file, "rb") as binary:
            hasher.update(binary.read())
    return hasher.digest().hex()


def _hash_is_valid(hash_path, files):
    try:
        with open(hash_path, "r") as file:
            validate_hash = json.load(file)["hash"]
            return _gen_md5_hash(files) == validate_hash
    except FileNotFoundError:
        return False


def _gen_file_hash(hash_path, files):
    file_hash = _gen_md5_hash(files)
    with open(hash_path, "w") as file:
        json.dump({"hash": file_hash}, file)


def _recursive_files(path):
    return [p for p in Path(path).rglob("*") if p.is_file()]


def setup():
    model_url = BLEURTScorer.MODEL_URL()
    model_path = BLEURTScorer.MODEL_PATH
    zip_path = model_path / "model.zip"
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)
    logger.info("begin")
    hash_path = model_path / f"{BLEURTScorer.MODEL}_hash.json"
    bleurt_folder = model_path / BLEURTScorer.MODEL

    logger.info("checking hash")
    if not hash_path.exists() or not _hash_is_valid(
        hash_path, _recursive_files(bleurt_folder)
    ):
        logger.info("downloading")
        download_file(model_url, zip_path, logger)
        logger.info("extracting...")
        with ZipFile(zip_path, "r") as zip_file:
            zip_file.extractall(model_path)
        logger.info("generating hash")
        _gen_file_hash(hash_path, _recursive_files(bleurt_folder))
    logger.info("done")


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()
