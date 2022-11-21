from itertools import chain

import numpy as np

from .util import filter_tokens, normalize, tokenize


class WordOverlap:
    def __init__(self, words, nlp):
        if isinstance(words, str):
            sentences = tokenize(words, nlp)
            words = list(
                chain.from_iterable(
                    [filter_tokens(sent, use_lemma=True) for sent in sentences]
                )
            )
        else:
            words = words.copy()
        self.words = set(words)

    def score(self, sentences):
        """number of words shared with the title"""
        features = []
        for sentence in sentences:
            words = set(filter_tokens(sentence, use_lemma=True))
            feature = len(words & self.words)
            features.append(feature)
        return normalize(features)
