import numpy as np


def inverse_score(sentences, start=1):
    """independent of number of sentences"""
    return 1 / np.arange(start, len(sentences) + start)


def linear_score(sentences):
    """dependent of number of sentences"""
    return np.linspace(1, 0, len(sentences), endpoint=False)


def position_score(sentences, linear=True, use_exp=False):
    """sentences at the beginning get a higher scores"""
    scores = linear_score(sentences) if linear else inverse_score(sentences)
    if use_exp:
        scores = 1.5**scores
    return scores
