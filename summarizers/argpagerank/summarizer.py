import json
import re
import os
import tensorflow_hub as hub
import numpy as np
import nltk
nltk.download('punkt')
from nltk import sent_tokenize
from argument import Argument
from sklearn.preprocessing import MinMaxScaler
from discreteMarkovChain import markovChain

from model_setup import SAVE_DIR

CLAIM_LEXICON_PATH = SAVE_DIR / "claim_lexicon.txt"

REMAP = {"-LRB-": "(", "-RRB-": ")", "-LCB-": "{", "-RCB-": "}",
         "-LSB-": "[", "-RSB-": "]", "``": '"', "''": '"'}

class ArgsRank(object):
    def __init__(self):
        self.claim_markers = open(CLAIM_LEXICON_PATH).read().split(", ")
        self.discourse_markers = ["for example", "such as", "for instance", "in the case of", "as revealed by",
                                  "illustrated by",
                                  "because", "so", "therefore", "thus", "consequently", "hence", "similarly",
                                  "likewise",
                                  "as with",
                                  "like", "equally", "in the same way", "first", "second ",
                                  "third,", "finally", "next", "meanwhile", "after", "then", "subsequently",
                                  "above all",
                                  "in particular", "especially", "significantly", "indeed", "notably", "but", "however",
                                  "although",
                                  "unless", "except", "apart from", "as long as", "if", "whereas", "instead of",
                                  "alternatively", "otherwise", "unlike", "on the other hand", "conversely"]

        self.d = 0.5 #TODO: Figure out the best value for this param..
        self.scaler = MinMaxScaler()
        self.embed = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")

    def clean_text(text):
        return re.sub(r"-LRB-|-RRB-|-LCB-|-RCB-|-LSB-|-RSB-|``|''", lambda m: REMAP.get(m.group()), text)

    def get_topK(self, k):
        """
        Return the k highest scored sentences
        :param k:
        :return:
        """
        if self.sentences and self.score:
            if k <= len(self.score) and k <= len(self.sentences):
                ind = np.argpartition(np.array(self.score), -k)[-k:]
                ind = np.sort(ind)
                return np.array(self.sentences)[ind]
            else:
                return np.array(self.sentences)
    
    def power_method(self, M, epsilon):
        """
        Apply power methode to calculate stationary distribution for Matrix M

        :param M: numpy matrix
        :param epsilon:
        :return:
        """
        t = 0
        p_t = (np.ones((M.shape[0], 1)) * (1 / M.shape[0]))
        while True:

            t = t + 1
            p_prev = p_t
            p_t = np.dot(M.T, p_t)
            
            if np.isnan(p_t).any():
                break

            residual = np.linalg.norm(p_t - p_prev)

            if residual < epsilon:
                break
        return p_t


    def normalize_by_rowsum(self, M):
        for i in range(M.shape[0]):
            sum = np.sum(M[i])
            for j in range(M.shape[1]):
                M[i][j] = M[i][j] / sum
        return M


    def add_tp_ratio(self, cluster):
        """
        Create numpy array with aij = argumentativeness of sentence j


        :param cluster: cluster of arguments
        :return: (numpy array) teleportation matrix
        """

        row = []

        for argument_j in cluster:
            for idx, sentence_j in enumerate(argument_j):
                value = 1.0
                for marker in self.discourse_markers:
                    if marker in sentence_j.lower():
                        value += 1
                if any(claim_ind in sentence_j.lower() for claim_ind in self.claim_markers):
                    value += 1

                row.append(value)
        message_embedding = []
        for argument in cluster:
            for sentence in argument:
                message_embedding.append(row)

        message_embedding = np.array(message_embedding)
        message_embedding = self.normalize_by_rowsum(message_embedding)
        return np.array(message_embedding)

    def sem_similarity_scoring(self, clusters):
        """
        Run biased PageRank using Universal Sentence Encoder to receive embedding.
        Calls add add_tp_ratio() and add_syn_similarity().
        Computes similarity to conclusion.

        :param clusters:
        :return:
        """
        messages = []

        for idx, cluster in enumerate(clusters):
            messages = []
            for argument in cluster:
                messages = messages + argument.sentences
            message_embedding = [ message.numpy() for message in self.embed(messages)]

            sim = np.inner(message_embedding, message_embedding)
            matrix = self.add_tp_ratio(cluster)
            M = np.array(sim) * (1 - self.d) + np.array(matrix) * self.d
            mc = markovChain(M)
            mc.computePi('power')
            p  = mc.pi

            x = 0
            for i in range(len(cluster)):
                if not cluster[i].score:
                    score_exists = False
                else:
                    score_exists = True
                for j in range(len(cluster[i].sentences)):
                    if score_exists:
                        cluster[i].score[j] += p[x]
                        cluster[i].score[j] = cluster[i].score[j]

                    else:
                        cluster[i].score.append(p[x])
                    x += 1
                if (len(cluster[i].score) > 1):
                    cluster[i].score = list(
                        (cluster[i].score - min(cluster[i].score)) / (
                                max(cluster[i].score) - min(cluster[i].score)))
                else:
                    cluster[i].score = [1]



    def find_span(self, arg_txt, sent_txt):
        try:
            p = re.compile(re.escape(sent_txt))
            m = p.search(arg_txt)
            return list(m.span())
        except Exception as e:
            return None

    
    def generate_snippet(self, args, ratio):
        output = []
        self.sem_similarity_scoring([args])
        for arg in args:
            requested_summary_length = round(ratio * len(arg.sentences))
            summary=" ".join(arg.get_topK(requested_summary_length).tolist())
            output.append(summary)
        return output[0]

    def summarize(self,text, ratio=0.2):
        cluster = []
        arg = Argument()
        arg.premises = [{'text':text}]
        arg.id = 123
        arg.set_sentences(text)
        cluster.append(arg)
        return self.generate_snippet(cluster, ratio)
        

class SummarizerPlugin:
    def __init__(self):
        print("Initializing ArgPageRank")
        self.summarizer = ArgsRank()
    
    def summarize(self, *args, **kwargs):
        return self.summarizer.summarize(*args, **kwargs)
 
