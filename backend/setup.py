import contextlib
import logging
import os
import shutil
import sys
from math import ceil
from threading import Thread
from zipfile import ZipFile

import click
import nltk
import requests
import tensorflow as tf
import tensorflow_hub as hub
from allennlp.common.file_utils import cached_path as allennlp_cached_path
from gensim.models import KeyedVectors
from gensim.scripts.glove2word2vec import glove2word2vec
from sentence_transformers import __DOWNLOAD_SERVER__
from transformers import DistilBertConfig, DistilBertModel, DistilBertTokenizer
from transformers.file_utils import cached_path as transformers_cached_path

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
        logger.info(f"source url: {model_url}")
        logger.info(f"output path: {zip_path}")
        try:
            download_file(model_url, zip_path, logger)
        except Exception as e:
            logger.exception(f"Error downloading file: {e}")
            shutil.rmtree(data_path)
            return

        # extract the relevant file
        logger.info(f"extracting...")
        with ZipFile(zip_path, "r") as zip:
            zip.extract(extract_file, data_path)

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

    logger = logging.getLogger("distilbert")
    logger.setLevel(logging.INFO)

    logger.info("begin")

    config_url = DistilBertConfig.pretrained_config_archive_map[model_name]
    tokenizer_url = DistilBertTokenizer.pretrained_vocab_files_map['vocab_file'][model_name]
    model_url = DistilBertModel.pretrained_model_archive_map[model_name]

    try:
        logger.info("download config file...")
        transformers_cached_path(config_url, resume_download=True)
        logger.info("download config file done")
    except Exception as e:
        logger.exception(f"problem downloading config file: {e}")

    try:
        logger.info("download tokenizer file...")
        transformers_cached_path(tokenizer_url, resume_download=True)
        logger.info("download tokenizer file done")
    except Exception as e:
        logger.exception(f"problem downloading tokenizer file: {e}")

    try:
        logger.info("download model file...")
        transformers_cached_path(model_url, resume_download=True)
        logger.info("download model file done")
    except Exception as e:
        logger.exception(f"problem downloading model file: {e}")
    logger.info("done")


def setup_bert():
    model_name = 'bert-base-nli-mean-tokens'
    model_url = __DOWNLOAD_SERVER__ + model_name + '.zip'
    data_path = os.path.expanduser('~/.cache/torch/sentence_transformers')
    folder_name = model_url.replace("https://", "").replace("http://", "").replace("/", "_")[:250]
    model_path = os.path.join(data_path, folder_name)
    zip_path = os.path.join(model_path, 'model.zip')

    logger = logging.getLogger("bert")
    logger.setLevel(logging.INFO)

    logger.info("begin")

    # if less then 2 files in folder then there is no file
    # or only the zip (could be corrupted because of a former
    # interrupt) -> redownload to be save
    if not os.path.exists(model_path) or len(os.listdir(model_path)) < 2:
        logger.info("fetch bert model")
        os.makedirs(model_path, exist_ok=True)

        logger.info(f"source url: {model_url}")
        logger.info(f"output path: {zip_path}")
        try:
            download_file(model_url, zip_path, logger)
        except Exception as e:
            logger.exception(f"Error downloading file: {e}")
            shutil.rmtree(model_path)
            return

        logger.info(f"extracting...")
        with ZipFile(zip_path, "r") as zip:
            zip.extractall(model_path)
    else:
        logger.info("model in cache")
    logger.info("done")


def setup_elmo():
    options_file = "https://allennlp.s3.amazonaws.com/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_options.json"
    weight_file = "https://allennlp.s3.amazonaws.com/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_weights.hdf5"

    logger = logging.getLogger("elmo")
    logger.setLevel(logging.INFO)

    logger.info("begin")
    logger.info("download options file...")
    with open(os.devnull, "w") as devnull:
        with contextlib.redirect_stderr(devnull):
            allennlp_cached_path(options_file)
    logger.info("download options file done")
    logger.info("download weight file...")
    with open(os.devnull, "w") as devnull:
        with contextlib.redirect_stderr(devnull):
            allennlp_cached_path(weight_file)
    logger.info("download weight file done")
    logger.info("done")


def setup_use():
    module_url = "https://tfhub.dev/google/universal-sentence-encoder/4"
    logger = logging.getLogger("use")
    logger.setLevel(logging.INFO)

    logger.info("begin")
    os.environ["TFHUB_CACHE_DIR"] = os.path.expanduser("~/.cache/tensorflow")
    hub.resolve(module_url)
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

    # bert -> sentencesimilarity
    bert_thread = Thread(target=setup_bert, daemon=True)
    bert_thread.start()

    # elmo -> sentencesimilarity
    elmo_thread = Thread(target=setup_elmo, daemon=True)
    elmo_thread.start()

    # use -> sentencesimilarity
    use_thread = Thread(target=setup_use, daemon=True)
    use_thread.start()

    # distel bert -> moverscore model
    distilbert_thread = Thread(target=setup_distilbert, daemon=True)
    distilbert_thread.start()

    nltk_thread.join()
    glove_thread.join()
    bert_thread.join()
    elmo_thread.join()
    use_thread.join()
    distilbert_thread.join()

    logger.info("done")


if __name__ == "__main__":
    setup()
