from functools import partial

import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from .util import filter_tokens


def average_lexical_connectivity(sentences, use_exp=True):
    """number of terms in a sentence shared with other sentences
    divided by the length of the sentence"""
    analyzer = partial(filter_tokens, use_lemma=True)
    vectorizer = CountVectorizer(binary=True, analyzer=analyzer)
    try:
        matrix = vectorizer.fit_transform(sentences)
    except ValueError:
        return [1] * len(sentences)
    shared_terms = np.asarray(matrix.sum(axis=0)).ravel() > 1
    features = []
    for row_index in range(matrix.shape[0]):
        feature = shared_terms[matrix[row_index].nonzero()[1]].sum()
        feature_len = max(len(analyzer(sentences[row_index])), 1)
        features.append(feature / feature_len)
    scores = np.array(features)
    if use_exp:
        scores = np.exp(scores)
    return scores
