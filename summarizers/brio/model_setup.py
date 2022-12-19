import inspect
import logging

from summarizer import SummarizerPlugin


def setup():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)

    logger.info("downloading model")
    SummarizerPlugin()
    logger.info("done")


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{", level="INFO")
    setup()
