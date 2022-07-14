import spacy
from metric import MODEL

if not spacy.util.is_package(MODEL):
    spacy.cli.download(MODEL)
