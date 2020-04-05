import os
from os import path

import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
from allennlp.modules.elmo import Elmo, batch_to_ids
from sentence_transformers import SentenceTransformer
from spacy.lang.en import English
from spacy.tokenizer import Tokenizer

from basic import (angular_distance, cosine_sim, euclidean_dist, inner_product,
                   manhattan_dist, vector_summation)
from ts_ss import triangle_sector_similarity

methods = {
    'cosine': cosine_sim,
    'manhattan': manhattan_dist,
    'euclidean': euclidean_dist,
    'angular': angular_distance,
    'inner': inner_product,
    'ts-ss': triangle_sector_similarity,
}


class BERTCalculator:
    def __init__(self):
        self.model = SentenceTransformer('bert-base-nli-mean-tokens')

    def calculate(self, method, hyps, refs):
        if method not in methods:
            return False

        hyps_encoding = self.model.encode(hyps)
        refs_encoding = self.model.encode(refs)
        hyps_embed = np.asarray(hyps_encoding)
        refs_embed = np.asarray(refs_encoding)

        method = methods[method]
        return method(hyps_embed, refs_embed)


class ELMoCalculator:
    options_file = "https://allennlp.s3.amazonaws.com/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_options.json"
    weight_file = "https://allennlp.s3.amazonaws.com/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_weights.hdf5"

    def __init__(self):
        self.model = Elmo(self.options_file, self.weight_file, 1, dropout=0)

    def calculate(self, method, sentences):
        if method not in methods:
            return False

        nlp = English()
        tokenizer = Tokenizer(nlp.vocab)

        sentences = [[tok.text for tok in tokenizer(sentence)]
                     for sentence in sentences]

        char_ids = batch_to_ids(sentences)

        embeddings = self.model(char_ids)['elmo_representations'][0]
        embeddings = embeddings.detach().numpy()

        summed_embeddings = vector_summation(embeddings)

        method = methods[method]

        return method(summed_embeddings, summed_embeddings)


class USECalculator:
    module_url = "https://tfhub.dev/google/universal-sentence-encoder/4"

    def __init__(self):
        os.environ["TFHUB_CACHE_DIR"] = path.expanduser("~/.cache/tensorflow")
        self.model = hub.load(self.module_url)

    def calculate(self, method, hyps, refs):
        if method not in methods:
            return False

        hyps_embedding = self.model(hyps)
        refs_embedding = self.model(refs)
        method = methods[method]

        return method(hyps_embedding, refs_embedding)
