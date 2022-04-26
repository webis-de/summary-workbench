import spacy
import numpy as np

from summarizer.util import filter_tokens


def get_stopwords(sentence):
    return [token for token in sentence if token.is_stop]


def stopword_ratio(sentences):
    """number of non-stopwords in the sentence divided by the
    number of words in the sentence"""
    return 1 - np.array(
        [len(get_stopwords(sent)) / np.max((len(filter_tokens(sent, remove_stopwords=False)), 1)) for sent in sentences]
    )
