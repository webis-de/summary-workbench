import sys

from model_setup import DATA_PATH, SAVE_PATH

sys.path.insert(0, "./guided_summarization/bart")
from fairseq.models.bart.guided_model import GuidedBARTModel

MODEL_PATH = SAVE_PATH
DATA_PATH = DATA_PATH / "data"


class GuidedBART(object):
    def __init__(self):
        self.bart = GuidedBARTModel.from_pretrained(
            str(MODEL_PATH), "bart_sentence.pt", str(DATA_PATH)
        )
        if self.bart:
            print("Initialized GuidedBART.")
            self.bart.eval()

    def summarize(self, text, ratio=0.2, guidance=None):
        texts = [text]
        sents = self.bart.sample(
            texts,
            [guidance],
            beam=4,
            lenpen=2.0,
            max_len_b=140,
            min_len=55,
            no_repeat_ngram_size=3,
            guided=True,
        )
        return " ".join(sents)


class SummarizerPlugin:
    def __init__(self):
        self.summarizer = GuidedBART()

    def summarize(self, batch, ratio):
        return [self.summarizer.summarize(text, ratio) for text in batch]
