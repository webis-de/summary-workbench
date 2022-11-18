import numpy as np
from .util import filter_tokens

def length_score(sentences, use_exp=True):
    """length of the sentence divided by the maximum sentence length
    """
    sent_length = np.array([len(filter_tokens(sent)) for sent in sentences])
    scores = sent_length/np.max((np.max(sent_length), 1))
    if use_exp:
        scores = np.exp(scores)
    return scores
