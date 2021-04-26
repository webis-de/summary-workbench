from rouge import Rouge

class MetricPlugin:
    def __init__(self):
        self.rouge = Rouge()

    def evaluate(self, hypotheses, references):
        scores = self.rouge.get_scores(hypotheses, references, avg=True)
        return {score[-1]: info["f"] for score, info in scores.items()}
