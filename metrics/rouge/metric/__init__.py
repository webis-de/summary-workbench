from rouge import Rouge

class RougeScorer:
    def __init__(self):
        self.rouge = Rouge()

    def score(self, hypotheses, references):
        scores = self.rouge.get_scores(hypotheses, references, avg=True)
        return {score.replace("-", " "): info["f"] for score, info in scores.items()}
