import numpy as np
from sentence_transformers import SentenceTransformer

from .basic import (angular_distance, cosine_sim, euclidean_dist,
                    inner_product, manhattan_dist)
from .ts_ss import triangle_sector_similarity

METHODS = {
    "cosine": cosine_sim,
    "manhattan": manhattan_dist,
    "euclidean": euclidean_dist,
    "angular": angular_distance,
    "inner": inner_product,
    "ts-ss": triangle_sector_similarity,
}


class Bert:
    def __init__(self):
        self.model = SentenceTransformer("bert-base-nli-mean-tokens")

    def score(self, method, hyps, refs):
        if method not in METHODS:
            raise ValueError(method)

        hyps_encoding = self.model.encode(hyps)
        refs_encoding = self.model.encode(refs)
        hyps_embed = np.asarray(hyps_encoding)
        refs_embed = np.asarray(refs_encoding)

        method = METHODS[method]
        scores = []
        for hyp_embed, ref_embed in zip(hyps_embed, refs_embed):
            hyp_embed = hyp_embed.reshape(1, -1)
            ref_embed = ref_embed.reshape(1, -1)
            score = method(hyp_embed, ref_embed)[0, 0]
            scores.append(score)
        return float(np.average(scores))
