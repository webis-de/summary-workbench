import sys
sys.path.insert(0, "/tldr_plugin_files/guided_summarization/bart")
from fairseq.models.bart.guided_model import GuidedBARTModel
from pathlib import Path

CHECKPOINT_PATH = "/tldr_plugin_files/checkpoint/"
DATA_PATH = "/tldr_plugin_files/data/data"

class GuidedBART(object):
    def __init__(self):
        self.bart = GuidedBARTModel.from_pretrained(Path(CHECKPOINT_PATH),"bart_sentence.pt", DATA_PATH)
        if self.bart:
            print("Initialized GuidedBART.")
            self.bart.eval()
    
    def summarize(self, text=None, guidance=None, ratio=0.2):
        texts= [text]
        if guidance:
            gs = [guidance]
        else:
            gs = [text.split(". ")[0]]
        sents = self.bart.sample(texts, gs, beam=4, lenpen=2.0, max_len_b=140, min_len=55, no_repeat_ngram_size=3, guided=True)
        return " ".join(sents)



class SummarizerPlugin:
    def __init__(self):
        self.summarizer = GuidedBART()
    
    def summarize(self, *args, **kwargs):
        return self.summarizer.summarize(*args, **kwargs)

