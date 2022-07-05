import numpy as np

def inverse_score(sentences, start=3):
    """independent of number of sentences"""
    return 1 / np.arange(start, len(sentences) + start)

def linear_score(sentences):
    """dependent of number of sentences"""
    return np.linspace(1, 0, len(sentences), endpoint=False)

def position_score(sentences, linear=True, use_exp=False, inverse_start=3):
    """gives sentences at the beginning higher scores"""
    scores = linear_score(sentences) if linear else inverse_score(sentences, start=inverse_start)
    if use_exp:
        scores = np.exp(scores)
    return scores
