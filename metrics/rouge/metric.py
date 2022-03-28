from rouge import Rouge


class MetricPlugin:
    def __init__(self):
        self.rouge = Rouge()

    def evaluate(self, hypotheses, references):
        scores = self.rouge.get_scores(hypotheses, references, avg=False)
        if not scores:
            return []
        keys = scores[0].keys()
        return {key[-1]: [score[key]["f"] for score in scores] for key in keys}
