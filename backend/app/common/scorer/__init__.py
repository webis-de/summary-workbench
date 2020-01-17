from abc import ABC, abstractmethod


class Scorer(ABC):
    @abstractmethod
    def score(self, hypothesis, references):
        pass
