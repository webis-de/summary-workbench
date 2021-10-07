import spacy
import pytextrank


class SummarizerPlugin:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.nlp.add_pipe("textrank")

    def summarize(self, text, ratio):
        doc = self.nlp(text)
        limit_sentences = max(1, round(len(list(doc.sents)) * ratio * 0.4))
        most_important_sentences = doc._.textrank.summary(
            limit_phrases=128,
            limit_sentences=limit_sentences,
            preserve_order=True,
        )
        return " ".join(map(str, most_important_sentences))
