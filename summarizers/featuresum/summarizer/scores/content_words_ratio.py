import numpy as np

from .util import filter_tokens, normalize


def get_stopwords(sentence):
    return [token for token in sentence if token.is_stop]


def content_words_ratio(sentences):
    """number of non-stopwords in the sentence divided by the
    number of words in the sentence"""
    score = 1 - np.array(
        [
            len(get_stopwords(sent))
            / np.max((len(filter_tokens(sent, remove_stopwords=False)), 1))
            for sent in sentences
        ]
    )
    return normalize(score)
