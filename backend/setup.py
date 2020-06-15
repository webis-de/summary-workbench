import contextlib
import logging
import os
import shutil
from math import ceil
from threading import Thread
from zipfile import ZipFile

import nltk
import requests
from gensim.models import KeyedVectors
from gensim.scripts.glove2word2vec import glove2word2vec
from transformers import DistilBertConfig, DistilBertModel, DistilBertTokenizer, RobertaModel
from transformers.file_utils import cached_path

FORMAT = '{asctime} {levelname} [{name}] {message}'
DATEFMT = "%H:%M:%S"
logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style='{')


def download_file(url, save_path, logger=None):
    chunk_size = 20 * 1024**2

    req = requests.get(url, stream=True)
    req.raise_for_status()

    length = req.headers.get('Content-length')
    total = ceil(int(length)/chunk_size) if length is not None else None
    chunks = req.iter_content(chunk_size=chunk_size)

    with open(save_path, 'wb') as file:
        for i, chunk in enumerate(chunks, start=1):
            file.write(chunk)
            if logger is not None:
                logger.info(f"{i}/{total}")


def setup_nltk():
    logger = logging.getLogger("nltk data")
    logger.setLevel(logging.INFO)

    logger.info("begin")
    nltk.download('punkt', quiet=True)
    logger.info("done")

def setup_spacy():
    model = "en_core_web_md"
    logger = logging.getLogger(model)
    logger.setLevel(logging.INFO)
    spacy.load()

def setup_glove():
    data_path = os.path.expanduser("~/.cache/glove")
    model_name = "glove.6B.300d"
    glove_bin = "glove.6B.300d.model.bin"
    glove_path = os.path.join(data_path, glove_bin)

    logger = logging.getLogger(model_name)
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
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                cached_path(config_url, resume_download=True)
        logger.info("download config file done")
    except Exception as ex:
        logger.exception("problem downloading config file: %s", ex)

    try:
        logger.info("download tokenizer file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                cached_path(tokenizer_url, resume_download=True)
        logger.info("download tokenizer file done")
    except Exception as ex:
        logger.exception("problem downloading tokenizer file: %s", ex)

    try:
        logger.info("download model file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                cached_path(model_url, resume_download=True)
        logger.info("download model file done")
    except Exception as ex:
        logger.exception("problem downloading model file: %s", ex)
    logger.info("done")


def setup_roberta():
    model_name = 'roberta-large-mnli'

    logger = logging.getLogger(model_name)
    logger.setLevel(logging.INFO)

    logger.info("begin")
    model_url = RobertaModel.pretrained_model_archive_map[model_name]

    try:
        logger.info("download model file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                cached_path(model_url, resume_download=True)
        logger.info("download model file done")
    except Exception as ex:
        logger.exception("problem downloading model file: %s", ex)
    logger.info("done")


def setup():
    logger = logging.getLogger("setup")
    logger.setLevel(logging.INFO)

    logger.info("begin")

    # tokenize (punkt) -> nlgeval (greedy matching)
    nltk_thread = Thread(target=setup_nltk, daemon=True)
    nltk_thread.start()

    # glove -> nlgeval (greedy matching)
    glove_thread = Thread(target=setup_glove, daemon=True)
    glove_thread.start()

    # distil bert -> moverscore model
    distilbert_thread = Thread(target=setup_distilbert, daemon=True)
    distilbert_thread.start()
    distilbert_thread.join()

    # roberta -> bert metric
    roberta_thread = Thread(target=setup_roberta, daemon=True)
    roberta_thread.start()

    nltk_thread.join()
    glove_thread.join()
    roberta_thread.join()

    logger.info("done")


if __name__ == "__main__":
    setup()
