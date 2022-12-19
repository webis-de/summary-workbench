import numpy as np
from scipy.stats import norm


def position_score(sentences):
    """Percentiles of the normal distribution where the percentiles
    correspond to the position of the sentences in the document and
    are equally distributed in the interval (0, 1). Sentences closer
    to the beginning of the document get a higher score."""
    num_sentences = len(sentences)
    percentile = (np.arange(num_sentences) + 1) / (num_sentences + 1)
    scores = norm.isf(percentile)
    return scores
