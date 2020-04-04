import logging
import os
from math import ceil
from threading import Thread
from zipfile import ZipFile

import click
import nltk
import requests
from transformers import DistilBertConfig, DistilBertModel, DistilBertTokenizer
from transformers.file_utils import cached_path

from gensim.models import KeyedVectors
from gensim.scripts.glove2word2vec import glove2word2vec


format = '{asctime} {levelname} [{name}] {message}'
datefmt = "%H:%M:%S"
logging.basicConfig(format=format, datefmt=datefmt, style='{')


def download_file(url, save_path, logger=None):
    chunk_size = 20 * 1024**2

    req = requests.get(url, stream=True)
    req.raise_for_status()

    length = req.headers.get('Content-length')
    total = ceil(int(length)/chunk_size) if length is not None else None
    chunks = req.iter_content(chunk_size=chunk_size)

    with open(save_path, 'wb') as f:
        for i, chunk in enumerate(chunks, start=1):
            f.write(chunk)
            if logger is not None:
                logger.info(f"{i}/{total}")


def setup_nltk():
    logger = logging.getLogger("nltk data")
    logger.setLevel(logging.INFO)

    logger.info("begin")
    nltk.download('punkt', quiet=True)
    logger.info("done")


def setup_glove():
    data_path = os.path.expanduser("~/.cache/glove")
    model_name = "glove.6B.300d"
    glove_bin = "glove.6B.300d.model.bin"

    logger = logging.getLogger(model_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")

    if not os.path.exists(data_path):
        try:
            os.makedirs(data_path)
        except FileExistsError:
            pass

    glove_path = os.path.join(data_path, glove_bin)

    if not os.path.exists(glove_path):
        logging.info("fetch glove model")

        zip_file = "glove.6B.zip"
        extract_file = "glove.6B.300d.txt"
        converted_file = "glove.6B.300d.model.txt"
        url = "http://nlp.stanford.edu/data/" + zip_file
        zip_path = os.path.join(data_path, zip_file)

        # download zip
        logger.info(f"source url: {url}")
        logger.info(f"output path: {zip_path}")
        try:
            download_file(url, zip_path, logger)
        except Exception as e:
            logger.exception(f"Error downloading file: {e}")
            return

        # extract the relevant file
        logger.info(f"extracting...")
        with ZipFile(os.path.join(data_path, zip_file)) as z:
            z.extract(extract_file, data_path)

        glove_raw_path = os.path.join(data_path, extract_file)
        glove_converted_path = os.path.join(data_path, converted_file)

        # convert to gensim format
        logger.info("converting to gensim format...")
        glove2word2vec(glove_raw_path, glove_converted_path)

        # convert to binary for fast loading
        logger.info("converting to binary...")
        m = KeyedVectors.load_word2vec_format(glove_converted_path)

        logger.info("saving binary...")
        m.save(glove_path)

        cached_files = [
            zip_path,
            glove_raw_path,
            glove_converted_path,
        ]

        # remove cached files
        logger.info("deleting cached files")
        for file in cached_files:
            if os.path.exists(file):
                logger.info(f"removing {file}")
                os.remove(file)
    else:
        logger.info("model in cache")

    logger.info("done")


def setup_distilbert():
    model_name = 'distilbert-base-uncased'

    logger = logging.getLogger(model_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")

    config_url = DistilBertConfig.pretrained_config_archive_map[model_name]
    tokenizer_url = DistilBertTokenizer.pretrained_vocab_files_map['vocab_file'][model_name]
    model_url = DistilBertModel.pretrained_model_archive_map[model_name]

    try:
        logger.info("download config file...")
        cached_path(config_url, resume_download=True)
        logger.info("download config file done")
    except Exception as e:
        logger.exception(f"problem downloading config file: {e}")

    try:
        logger.info("download tokenizer file...")
        cached_path(tokenizer_url, resume_download=True)
        logger.info("download tokenizer file done")
    except Exception as e:
        logger.exception(f"problem downloading tokenizer file: {e}")

    try:
        logger.info("download model file...")
        cached_path(model_url, resume_download=True)
        logger.info("download model file done")
    except Exception as e:
        logger.exception(f"problem downloading model file: {e}")
    logger.info("done")


def setup():
    logger = logging.getLogger("setup")
    logger.setLevel(logging.INFO)

    logger.info("begin")

    nltk_thread = Thread(target=setup_nltk, daemon=True)
    nltk_thread.start()

    glove_thread = Thread(target=setup_glove, daemon=True)
    glove_thread.start()

    distilbert_thread = Thread(target=setup_distilbert, daemon=True)
    distilbert_thread.start()

    nltk_thread.join()
    glove_thread.join()
    distilbert_thread.join()

    logger.info("done")


if __name__ == "__main__":
    setup()
