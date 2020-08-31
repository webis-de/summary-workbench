from bert_score import BERTScorer as Bert
from metric import BERTScorer
import logging
import os
import contextlib
import inspect

def setup():
    model_name = BERTScorer.MODEL
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)
    logger.info("begin")

    try:
        logger.info("download model file...")
        with open(os.devnull, "w") as devnull:
            with contextlib.redirect_stdout(devnull):
                Bert(model_type=model_name)
        logger.info("download model file done")
    except Exception as ex:
        logger.exception("problem downloading model file: %s", ex)
    logger.info("done")

if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()