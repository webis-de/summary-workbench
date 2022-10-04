import nltk
import spacy

SPACY_MODEL = "en_core_web_md"


def setup():
    spacy.cli.download(SPACY_MODEL)
    nltk.download("punkt")


if __name__ == "__main__":
    setup()
