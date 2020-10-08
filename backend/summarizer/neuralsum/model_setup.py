import inspect
import logging

from summarizer import NEURALSUM_MODEL, NeuralSummarizer


def setup():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)

    logger.info("downloading %s", NEURALSUM_MODEL)
    NeuralSummarizer(NEURALSUM_MODEL)
    logger.info("done")


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()
