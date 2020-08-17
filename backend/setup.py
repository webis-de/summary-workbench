import contextlib
import logging
import os
import shutil
from math import ceil
from threading import Thread
from zipfile import ZipFile
from bert_score import BERTScorer as Bert
import inspect
from hashlib import md5
import json

import nltk
import requests
from gensim.models import KeyedVectors
from gensim.scripts.glove2word2vec import glove2word2vec

import spacy
from pathlib import Path
from transformers import (DistilBertConfig, DistilBertModel, DistilBertTokenizer)

FORMAT = "{asctime} {levelname} [{name}] {message}"
DATEFMT = "%H:%M:%S"
logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")


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


def setup_nltk():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")
    nltk.download("punkt", quiet=True)
    logger.info("done")


def setup_spacy():
    model = "en_core_web_md"
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)
    spacy.load(model)


def setup_glove():
    data_path = os.path.expanduser("~/.cache/glove")
    model_name = "glove.6B.300d"
    glove_bin = "glove.6B.300d.model.bin"
    glove_path = os.path.join(data_path, glove_bin)

    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")

    if not os.path.exists(glove_path):
        logging.info("fetch glove model")
        os.makedirs(data_path, exist_ok=True)

        zip_file = "glove.6B.zip"
        extract_file = "glove.6B.300d.txt"
        converted_file = "glove.6B.300d.model.txt"
        model_url = "http://nlp.stanford.edu/data/" + zip_file
        zip_path = os.path.join(data_path, zip_file)

        # download zip
        logger.info("source url: %s", model_url)
        logger.info("output path: %s", zip_path)
        try:
            download_file(model_url, zip_path, logger)
        except Exception as ex:
            logger.exception("Error downloading file: %s", ex)
            shutil.rmtree(data_path)
            return

        # extract the relevant file
        logger.info("extracting...")
        with ZipFile(zip_path, "r") as zip_file:
            zip_file.extract(extract_file, data_path)

        glove_raw_path = os.path.join(data_path, extract_file)
        glove_converted_path = os.path.join(data_path, converted_file)

        # convert to gensim format
        logger.info("converting to gensim format...")
        glove2word2vec(glove_raw_path, glove_converted_path)

        # convert to binary for fast loading
        logger.info("converting to binary...")
        model = KeyedVectors.load_word2vec_format(glove_converted_path)

        logger.info("saving binary...")
        model.save(glove_path)

        cached_files = [
            zip_path,
            glove_raw_path,
            glove_converted_path,
        ]

        # remove cached files
        logger.info("deleting cached files")
        for file in cached_files:
            if os.path.exists(file):
                logger.info("removing %s", file)
                os.remove(file)
    else:
        logger.info("model in cache")

    logger.info("done")

def _gen_md5_hash(files):
    hasher = md5()
    for file in files:
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

def setup_bleurt():
    file_name = "bleurt-base-128"
    zip_file = file_name + ".zip"
    model_url = "https://storage.googleapis.com/bleurt-oss/" + zip_file
    data_path = os.path.expanduser("~/.cache/bleurt/")
    zip_path = os.path.join(data_path, zip_file)
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)
    logger.info("begin")
    hash_path = os.path.join(data_path, "hash.json")
    bleurt_folder = os.path.join(data_path, file_name)

    logger.info("checking hash")
    if not Path(hash_path).exists() or not _hash_is_valid(hash_path, _recursive_files(bleurt_folder)):
        logger.info("downloading")
        download_file(model_url, zip_path, logger)
        logger.info("extracting...")
        with ZipFile(zip_path, "r") as zip_file:
            zip_file.extractall(data_path)
        logger.info("generating hash")
        _gen_file_hash(hash_path, _recursive_files(bleurt_folder))
    logger.info("done")


def setup_distilbert():
    model_name = "distilbert-base-uncased"

    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")

    try:
        logger.info("download config file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                DistilBertConfig.from_pretrained(model_name)
        logger.info("download config file done")
    except Exception as ex:
        logger.exception("problem downloading config file: %s", ex)

    try:
        logger.info("download tokenizer file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                DistilBertTokenizer.from_pretrained(model_name)
        logger.info("download tokenizer file done")
    except Exception as ex:
        logger.exception("problem downloading tokenizer file: %s", ex)

    try:
        logger.info("download model file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                DistilBertModel.from_pretrained(model_name)
        logger.info("download model file done")
    except Exception as ex:
        logger.exception("problem downloading model file: %s", ex)
    logger.info("done")


def setup_roberta():
    model_name = "roberta-large-mnli"
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")

    try:
        logger.info("download model file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                Bert(model_type=model_name)
        logger.info("download model file done")
    except Exception as ex:
        logger.exception("problem downloading model file: %s", ex)
    logger.info("done")


def setup():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")

    # tokenize (punkt) -> nlgeval (greedy matching)
    nltk_thread = Thread(target=setup_nltk, daemon=True)
    nltk_thread.start()

    # glove -> nlgeval (greedy matching)
    glove_thread = Thread(target=setup_glove, daemon=True)
    glove_thread.start()

    bleurt_thread = Thread(target=setup_bleurt, daemon=True)
    bleurt_thread.start()

    # distil bert -> moverscore model
    distilbert_thread = Thread(target=setup_distilbert, daemon=True)
    distilbert_thread.start()

    # roberta -> bert metric
    roberta_thread = Thread(target=setup_roberta, daemon=True)
    distilbert_thread.join()                                        # join here because else: "ValueError: I/O operation on closed file"

    roberta_thread.start()

    nltk_thread.join()
    glove_thread.join()
    bleurt_thread.join()
    roberta_thread.join()

    logger.info("done")


if __name__ == "__main__":
    setup()
