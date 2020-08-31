import contextlib
import inspect
import logging
import os

from transformers import DistilBertConfig, DistilBertModel, DistilBertTokenizer


def setup():
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
    except Exception as error:
        logger.exception("problem downloading config file: %s", error)

    try:
        logger.info("download tokenizer file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                DistilBertTokenizer.from_pretrained(model_name)
        logger.info("download tokenizer file done")
    except Exception as error:
        logger.exception("problem downloading tokenizer file: %s", error)

    try:
        logger.info("download model file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stderr(devnull):
                DistilBertModel.from_pretrained(model_name)
        logger.info("download model file done")
    except Exception as error:
        logger.exception("problem downloading model file: %s", error)
    logger.info("done")


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()
