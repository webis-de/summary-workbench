import inspect
import logging

import nltk

from summarizer import BertSummarizer
from summarizer.BertParent import BertParent


def setup():
    model_name = BertSummarizer.MODEL
    model, tokenizer = BertParent.MODELS[model_name]

    logger = logging.getLogger(inspect.currentframe().f_code.co_name)

    logger.info("downloading %s", model_name)
    model.from_pretrained(model_name, output_hidden_states=True)
    tokenizer.from_pretrained(model_name)
    logger.info("done")
    nltk.download("punkt")


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()
