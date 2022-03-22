import spacy
import os
import pytextrank


class BiasedTextRankModel(object):
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.nlp.add_pipe("biasedtextrank")

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

    def get_sentences_from_phrases(self, doc, phrases):
        sentences = []
        limit_phrases = round(len(phrases) * 0.3)
        for phrase  in phrases[:limit_phrases]:
            for sent in doc.sents:
                if phrase.text in sent.text and sent.text not in sentences:
                    sentences.append(sent.text)
        return sentences

    def order_sentences(self, ranked_sents, original_sents):
        return [s for s in original_sents if s in ranked_sents]

    def summarize(self, text, ratio=0.2, focus="Influential"):
        doc = self.nlp(text)
        print("Focus text is {}".format(focus))
        if focus:
            ranked_phrases = doc._.textrank.change_focus(focus, bias=10.0)
            sentences = self.get_sentences_from_phrases(doc, ranked_phrases)
            summary_sents = self.take_ratio(sentences, ratio)
            return " ".join(summary_sents)
        else:
            return {"error": "A focus text must be provided."}
class SummarizerPlugin:
    def __init__(self):
        self.model = BiasedTextRankModel()
        print("Intialized Biased TextRank")

    def summarize(self, *args, **kwargs):
        return self.model.summarize(*args, **kwargs)
