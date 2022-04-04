import inspect
import logging

from summarizer import SummarizerPlugin


def setup():
    SummarizerPlugin()


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, level=logging.INFO, style="{")
    setup()
