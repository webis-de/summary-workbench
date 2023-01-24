import math
import unicodedata

import numpy as np
from gpt2 import CHECKPOINT_PATH, GPT2
from nltk import sent_tokenize

MARKS = {"Mn", "Mc", "Me"}


def strip_accents(text):
    text = unicodedata.normalize("NFD", text)
    return "".join(c for c in text if unicodedata.category(c) not in MARKS)


class PMISumm(object):
    def __init__(self):
        self.model = GPT2(location=CHECKPOINT_PATH)

    def get_probabilities(self, sentences):
        """
        Run a forward pass of GPT2 on the article and obtain word probabilities.
        """
        payload = self.model.get_probabilities(sentences, topk=20)
        res = [[] for i in range(len(sentences))]
        for t, sent in enumerate(sentences):
            context = ""
            chain = False
            next_word = ""
            sent_words = sent.split(" ")
            word_probability = 1.0
            gt_count = 0
            for i, word in enumerate(payload["context_strings"][t][:-1]):
                context = context + " " + word
                probability = payload["real_probs"][t][i]
                next_word_fragment = payload["context_strings"][t][i + 1]
                next_word += next_word_fragment
                if next_word == sent_words[gt_count]:
                    chain = False
                    gt_count += 1
                else:
                    chain = True
                word_probability *= probability
                assert word_probability <= 1.0, print(word_probability, context)
                if chain == False:
                    res[t].append(word_probability)
                    word_probability = 1.0
                    next_word = ""
                if gt_count == len(sent_words):
                    break
        return res

    def get_npmi_matrix(self, sentences, method=1, batch_size=1):
        """
        Accepts a list of sentences of length n and returns 3 objects:
        - Normalised PMI nxn matrix - temp
        - PMI nxn matrix - temp2
        - List of length n indicating sentence-wise surprisal i.e. p(sentence) - p

        To optimize performance, we do the forward pass batchwise by assembling the batch and maintaining batch indices
        For each batch we call get_probabilities
        """
        npmi_matrix = np.zeros((len(sentences), len(sentences)))
        pmi_matrix = np.zeros((len(sentences), len(sentences)))
        batch_indices = {}
        batch = []
        batch_count = 0
        batch_size = batch_size
        c = 0
        p = []
        for i in range(len(sentences)):
            result = self.get_probabilities([sentences[i]])
            try:
                p.append(sum([math.log(i) for i in result[0]]))
            except:
                print("Math domain error", i)
                return npmi_matrix, pmi_matrix, p
        for i in range(len(sentences)):
            for j in range(len(sentences)):
                if i == j:
                    npmi_matrix[i][j] = -1
                    pmi_matrix[i][j] = -1
                    continue
                article = sentences[i] + " " + sentences[j]
                batch_indices[
                    str(i) + "-" + str(j) + "-" + str(len(sentences[i].split()))
                ] = batch_count
                batch.append(article)
                batch_count += 1
                if batch_count == batch_size or (
                    i == len(sentences) - 1 and j == len(sentences) - 1
                ):
                    c += 1
                    result = self.get_probabilities(batch)
                    for key in batch_indices.keys():
                        idx_i, idx_j, idx_k = [int(idx) for idx in key.split("-")]
                        try:
                            px = p[idx_i]
                            py = p[idx_j]
                            pxy = sum(
                                [
                                    math.log(q)
                                    for q in result[batch_indices[key]][idx_k:]
                                ]
                            )

                            npmi_matrix[idx_i][idx_j] = (pxy - py) / (-1 * (pxy + px))
                            pmi_matrix[idx_i][idx_j] = pxy - py
                        except ZeroDivisionError:
                            print("Zero division error", idx_i, idx_j)
                            npmi_matrix[idx_i][idx_j] = -1
                            pmi_matrix[idx_i][idx_j] = -1
                        except:
                            print("Math domain error", i, j)
                        if (
                            npmi_matrix[idx_i][idx_j] > 1
                            or npmi_matrix[idx_i][idx_j] < -1
                        ):
                            print(
                                "Normalize assertion",
                                npmi_matrix[idx_i][idx_j],
                                idx_i,
                                idx_j,
                            )
                    batch_count = 0
                    batch = []
                    batch_indices = {}
        return npmi_matrix, pmi_matrix, p

    def remove_unicode(self, text):
        return "".join([i if ord(i) < 128 else " " for i in strip_accents(text)])

    def summarize(self, text=None, ratio=0.2):
        sentences = sent_tokenize(text)
        sentences = [self.remove_unicode(sent) for sent in sentences]
        npmi, pmi, surprise = self.get_npmi_matrix(sentences, batch_size=10)
        pmi[pmi < 0] = 0
        relevance = [sum(pmi[idx]) for idx in range(len(sentences))]
        penalty = [0] * len(sentences)
        unselected = set(range(len(sentences)))
        selected = set()
        summary_length = round(len(sentences) * ratio)
        for _ in range(summary_length):
            max_idx = max(unselected, key=lambda i: relevance[i] - penalty[i])
            unselected.remove(max_idx)
            selected.add(max_idx)
            penalty = [p + pmi[i][max_idx] for i, p in enumerate(penalty)]
        return " ".join(sentences[i] for i in sorted(selected))


class SummarizerPlugin:
    def __init__(self):
        self.summarizer = PMISumm()

    def summarize(self, batch, ratio):
        return [self.summarizer.summarize(text, ratio) for text in batch]
