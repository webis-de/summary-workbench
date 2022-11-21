from functools import partial

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from .util import filter_tokens, normalize


def tfidf_score(sentences, use_lemma=False):
    """compute the score as the normalization of the sum of the tfidf vector
    entries minus the logarithm of the sentence length"""
    analyzer = partial(filter_tokens, use_lemma=use_lemma)
    vectorizer = TfidfVectorizer(analyzer=analyzer)
    try:
        tfidf = vectorizer.fit_transform(sentences)
    except ValueError:
        return np.ones(len(sentences))
    sentence_lengths = np.array([len(analyzer(s)) for s in sentences])
    tfidf_sum = np.asarray(tfidf.sum(axis=1)).ravel()
    n_tfidf_sum = normalize(tfidf_sum)
    n_log_len = normalize(np.log(sentence_lengths + 3))
    return n_tfidf_sum - n_log_len
