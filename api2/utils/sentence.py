import nltk
from utils.aio import to_threaded


@to_threaded
def sentence_split(text):
    return nltk.sent_tokenize(text)
