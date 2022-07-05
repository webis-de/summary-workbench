import os

import spacy

MODEL = os.environ["model"]


def setup():
    spacy.cli.download(MODEL)


if __name__ == "__main__":
    setup()
