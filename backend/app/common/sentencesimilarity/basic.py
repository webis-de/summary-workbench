import math
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances,  manhattan_distances


def angular_distance(src, tgt):
    cos_sim = cosine_similarity(src, tgt)
    np.fill_diagonal(cos_sim, 1)
    distance_ = 1 - (np.arccos(cos_sim) / math.pi)
    return distance_


def cosine_sim(src, tgt):
    similarity_ = cosine_similarity(src, tgt)
    return similarity_


def manhattan_dist(src, tgt):
    distance_ = manhattan_distances(src, tgt)
    return distance_


def euclidean_dist(src, tgt):
    distance_ = euclidean_distances(src, tgt)
    return distance_


def inner_product(src, tgt):
    similarity_ = np.inner(src, tgt)
    return similarity_


def vector_summation(sentences):
    sent_len = sentences.shape[1]
    summed_sentence_ = sentences.sum(axis=1) / sent_len
    return summed_sentence_
