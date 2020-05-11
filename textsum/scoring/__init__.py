import sys

sys.path.insert(1, ".")

from math import log10
from preprocessing import PreProcessor

from typing import List, Set, Tuple

class Scorer(object):
    def __init__(self):
        super().__init__()

    def _count_common_words(self, words_sentence_one:List[str], words_sentence_two:List[str]) -> int :
        return len(set(words_sentence_one) & set(words_sentence_two))

    def entity_overlap(self, sentence_1_entities : Set[Tuple[str, str]], sentence_2_entities: Set[Tuple[str, str]]) -> int :
        return len(sentence_1_entities.intersection(sentence_2_entities))

    def lexical_overlap(self, sentence_1 : str, sentence_2:str) -> float :
        words_sentence_one = sentence_1.split()
        words_sentence_two = sentence_2.split()
        common_word_count = self._count_common_words(
            words_sentence_one, words_sentence_two
        )

        log_s1 = log10(len(words_sentence_one))
        log_s2 = log10(len(words_sentence_two))

        if log_s1 + log_s2 == 0:
            return 0
        return common_word_count / (log_s1 + log_s2)

