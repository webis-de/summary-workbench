import torch
from bart_score import BARTScorer

DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"


class MetricPlugin:
    def __init__(self):
        self.bart = BARTScorer(device=DEVICE, checkpoint="facebook/bart-large-cnn")

    def evaluate(self, hypotheses, references):
        return self.bart.score(hypotheses, references, batch_size=4)
