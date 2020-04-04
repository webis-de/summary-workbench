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


options_file = "https://allennlp.s3.amazonaws.com/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_options.json"
weight_file = "https://allennlp.s3.amazonaws.com/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_weights.hdf5"
module_url = "https://tfhub.dev/google/universal-sentence-encoder/4"

methods = {
    'cosine': cosine_sim,
    'manhattan': manhattan_dist,
    'euclidean': euclidean_dist,
    'angular': angular_distance,
    'inner': inner_product,
    'ts-ss': triangle_sector_similarity,
}

class BERTCalculator:
    def calculate(self, method, sentences):
        if method not in methods:
            return False

        model = SentenceTransformer('bert-base-nli-mean-tokens')

        embed_sentences = np.asarray(model.encode(sentences))
        method = methods[method]

        similarity = method(embed_sentences, embed_sentences)
        return similarity


class ELMoCalculator:
    def calculate(self, method, sentences):
        if method not in methods:
            return False

        nlp = English()
        tokenizer = Tokenizer(nlp.vocab)

        sentences = [[tok.text for tok in tokenizer(sentence)]
                     for sentence in self.sentences]

        char_ids = batch_to_ids(sentences)

        elmo = Elmo(options_file, weight_file, 1, dropout=0)

        embeddings = elmo(char_ids)['elmo_representations'][0]
        embeddings = embeddings.detach().numpy()

        summed_embeddings = vector_summation(embeddings)

        method = methods[method]

        similarity = method(summed_embeddings, summed_embeddings)
        return similarity


class USECalculator:
    def calculate(self, method, sentences):
        if method not in methods:
            return False

        model = hub.load(module_url)

        embeddings = model(self.sentences)
        method = methods[method]

        similarity = method(embeddings, embeddings)
        return similarity
