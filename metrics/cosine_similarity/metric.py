from flair.embedding import FastTextEmbeddings
import numpy as np

class Metric:
    MODEL = "https://dl.fbaipublicfiles.com/fasttext/vectors-english/crawl-300d-2M-subword.zip"

    def __init__(self):
        self.model = FastTextEmbeddings(self.MODEL, use_local=False)

    def score(self, hypotheses, references):
        return {"bert": float(np.average(self.bert.score(hypotheses, references)[0], rescale_with_baseline=True, lang="en"))}
