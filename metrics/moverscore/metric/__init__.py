from .moverscore import MoverScore as MoverScore

class MoverScoreScorer:
    def __init__(self):
        self.mover_score = MoverScore()

    def score(self, hypotheses, references):
        return {"moverscore": self.mover_score.score(hypotheses, references)}
