import logging

from summarizer import SummarizerPlugin


def setup():
    logging.info("Downloading checkpoints")
    SummarizerPlugin()
    logging.info("Done")


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, level=logging.INFO, style="{")
    setup()
