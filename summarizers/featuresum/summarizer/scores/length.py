import numpy as np

from .util import filter_tokens, normalize


def length_score(sentences):
    """logarithm of the sentence length"""
    sentence_length = np.array([len(filter_tokens(sent)) for sent in sentences])
    scores = normalize(np.log(sentence_length + 3))
    return scores
