import spacy
import os 
import pytextrank

MODEL = os.environ["model"].lower() 

class TextRankModel(object):
    def __init__(self, model="textrank"):
        self.nlp = spacy.load("en_core_web_sm")
        self.nlp.add_pipe(model)
    
    def take_ratio(self, ranked_sents, ratio):
        ranked_sents = list(ranked_sents)
        num_tokens = sum(len(s) for s in ranked_sents)
        requested_tokens = round(ratio * num_tokens)
        token_count = 0
        taken_sents = []
        for sent in ranked_sents:
            prev_token_count = token_count
            token_count += len(sent)
            if taken_sents and (token_count - requested_tokens) > (
                requested_tokens - prev_token_count
            ):
                break
            taken_sents.append(sent)
        return taken_sents


    def order_sentences(self, ranked_sents, original_sents):
        return [s for s in original_sents if s in ranked_sents]    
    
    def summarize(self, text, ratio=0.2):
        doc = self.nlp(text)
        ranked_sents = doc._.textrank.summary(limit_phrases = round(len(doc._.phrases) * 0.3), limit_sentences = len(list(doc.sents)), preserve_order=False,)
        ranked_sents = self.take_ratio(ranked_sents, ratio)
        ranked_sents = self.order_sentences(ranked_sents, doc.sents)
        return " ".join(map(str, ranked_sents))
    
class SummarizerPlugin:
    def __init__(self):
        self.model = TextRankModel(model=MODEL)
    
    def summarize(self, *args, **kwargs):
        return self.model.summarize(*args, **kwargs)
