# pylint: disable=C0415,C0103
import os
from collections import defaultdict

from summ_eval.config import STATIC_PATH
from moverscore import STOPWORDS, MoverScore, MoverScoreV2
from .metric import Metric


class MoverScoreMetric(Metric):
    def __init__(
        self,
        version=1,
        stop_words=STOPWORDS,
        n_gram=1,
        remove_subwords=True,
        batch_size=32,
    ):
        """
        Mover Score metric
        Interfaces https://github.com/AIPHES/emnlp19-moverscore

        NOTE: mover score assumes GPU usage

        Args:
                :param version: Which version of moverscore to use; v2 makes use of DistilBert and will
                        run quicker.
                :param stop_wordsf: path to file with space-separated list of stopwords
                :param n_gram: n_gram size to use in mover score calculation; see Section 3.1 of paper for details
                :param remove_subwords: whether to remove subword tokens before calculating n-grams and proceeding
                        with mover score calculation
                :param batch_size:
                        batch size for mover score calculation; change according to hardware for improved speed
        """
        self.version = version
        if self.version == 1:
            self.scorer = MoverScore()
        else:
            self.scorer = MoverScoreV2()
        self.stop_words = stop_words
        self.n_gram = n_gram
        self.remove_subwords = remove_subwords
        self.batch_size = batch_size

    def evaluate_example(self, summary, reference):
        score = self.scorer.score(
            [reference],
            [summary],
            stop_words=self.stop_words,
            n_gram=self.n_gram,
            remove_subwords=self.remove_subwords,
        )
        score_dict = {"mover_score": score[0]}
        return score_dict

    def evaluate_batch(self, summaries, references, aggregate=True):
        scores = self.scorer.score(
            references,
            summaries,
            stop_words=self.stop_words,
            n_gram=self.n_gram,
            remove_subwords=self.remove_subwords,
            batch_size=self.batch_size,
        )
        if aggregate:
            return {"mover_score": sum(scores) / len(scores)}
        else:
            return [{"mover_score": score} for score in scores]

    @property
    def supports_multi_ref(self):
        return True
