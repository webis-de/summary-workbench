import inspect
import logging

import nltk


def setup():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)

    logger.info("setup nltk")
    nltk.download("punkt")
    logger.info("done")


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()
