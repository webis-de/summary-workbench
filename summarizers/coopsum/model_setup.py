import inspect
import logging
from summarizer import MODEL
import nltk
from summarizer import SummarizerPlugin


def setup():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    logger.info("Initializing %s", MODEL)
    nltk.download("punkt")
    SummarizerPlugin()
    logger.info("Done initializing %s", MODEL)



if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()