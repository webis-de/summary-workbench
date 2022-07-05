from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
from summarizer.util import filter_tokens
from functools import partial


def average_lexical_connectivity(sentences, use_exp=True):
    """number of terms in a sentences shared with other sentences
    divided by the number of sentences"""
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
        features.append(feature)
    scores = np.array(features) / len(sentences)
    if use_exp:
        scores = np.exp(scores)
    return scores
