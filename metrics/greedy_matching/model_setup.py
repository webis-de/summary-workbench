import inspect
import json
import logging
import shutil
from hashlib import md5
from math import ceil
from pathlib import Path
from urllib.parse import urljoin
from zipfile import ZipFile

import nltk
import requests
from gensim.models import KeyedVectors
from gensim.scripts.glove2word2vec import glove2word2vec

from metric import MetricPlugin


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


def setup_nltk():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")
    nltk.download("punkt", quiet=True)
    logger.info("done")


def setup_glove():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")

    base_path = MetricPlugin.MODEL_BASE_PATH
    model_path = MetricPlugin.MODEL_PATH()

    hash_path = base_path / f"{MetricPlugin.MODEL_NAME}_hash.json"
    if not _hash_is_valid(hash_path, [model_path]):
        logging.info("fetch glove model")
        base_path.mkdir(parents=True, exist_ok=True)

        model_file = MetricPlugin.MODEL_NAME
        extract_file = f"{model_file}.txt"
        converted_file = f"{model_file}.model.txt"
        model_url = MetricPlugin.MODEL_URL()
        zip_file = "model.zip"
        zip_path = base_path / zip_file

        # download zip
        logger.info("source url: %s", model_url)
        logger.info("output path: %s", zip_path)
        try:
            download_file(model_url, zip_path, logger)
        except Exception as ex:
            logger.exception("Error downloading file: %s", ex)
            shutil.rmtree(base_path)
            return

        # extract the relevant file
        logger.info("extracting...")
        with ZipFile(zip_path, "r") as zip_file:
            zip_file.extract(extract_file, base_path)

        glove_raw_path = base_path / extract_file
        glove_converted_path = base_path / converted_file

        # convert to gensim format
        logger.info("converting to gensim format...")
        glove2word2vec(str(glove_raw_path), str(glove_converted_path))

        # convert to binary for fast loading
        logger.info("converting to binary...")
        model = KeyedVectors.load_word2vec_format(glove_converted_path)

        logger.info("saving binary...")
        model.save(str(model_path))

        cached_files = [
            zip_path,
            glove_raw_path,
            glove_converted_path,
        ]

        # remove cached files
        logger.info("deleting cached files")
        for file in cached_files:
            if file.exists():
                logger.info("removing %s", file)
                file.unlink()
        logger.info("generating hash")
        _gen_file_hash(hash_path, [model_path])
    else:
        logger.info("model in cache")
    logger.info("done")


def setup():
    setup_glove()
    setup_nltk()


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()
