from bart_score import BARTScorer

DEVICE = "cpu"


class MetricPlugin:
    def __init__(self):
        self.bart = BARTScorer(device=DEVICE, checkpoint="facebook/bart-large-cnn")

    def evaluate(self, batch):
        hypotheses, references = zip(*batch)
        return self.bart.score(hypotheses, references, batch_size=len(batch))
