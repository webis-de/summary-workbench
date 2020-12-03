import inspect
import logging

from metric import SentenceTransformersScorer


def setup():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.setLevel(logging.INFO)
    logger.info("begin")
    SentenceTransformersScorer()
    logger.info("done")


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()
