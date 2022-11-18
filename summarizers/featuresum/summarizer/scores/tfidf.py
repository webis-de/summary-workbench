from functools import partial

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from summarizer.util import filter_tokens


def sum_feature(matrix):
    """add up the entries of the matrix for each row"""
    return np.asarray(matrix.sum(axis=1)).ravel()


def mul_feature(matrix):
    """add 1 to each entry in the matrix and multiply
    the entries for each row"""
    features = []
    for row_index in range(matrix.shape[0]):
        feature = (matrix[row_index].data + 1).prod()
        features.append(feature)
    return np.array(features)


def tfidf_score(sentences, smooth_idf=False, use_lemma=False):
    """compute the score as the sum of the tfidf vector
    entries divided by sentence length"""
    analyzer = partial(filter_tokens, use_lemma=use_lemma)
    vectorizer = TfidfVectorizer(analyzer=analyzer, smooth_idf=smooth_idf)
    try:
        tfidf = vectorizer.fit_transform(sentences)
    except ValueError:
        return np.ones(len(sentences))
    sentence_lengths = np.array([len(analyzer(s)) for s in sentences])
    sentence_lengths = np.maximum(sentence_lengths, 1)
    features = sum_feature(tfidf) / sentence_lengths
    return features
