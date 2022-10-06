import spacy
import os
import pytextrank


class TopicRankModel(object):
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.nlp.add_pipe("topicrank")

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

    def summarize(self, text, ratio=0.2):
        doc = self.nlp(text)
        ranked_sents = doc._.textrank.summary(limit_phrases = round(len(doc._.phrases) * 0.3), limit_sentences = len(list(doc.sents)), preserve_order=False,)
        ranked_sents = self.take_ratio(ranked_sents, ratio)
        ranked_sents = self.order_sentences(ranked_sents, doc.sents)
        summary_sents = [str(s).strip() for s in list(ranked_sents)]
        return " ".join(summary_sents)

class SummarizerPlugin:
    def __init__(self):
        self.model = TopicRankModel()
        print("Intialized  TopicRank")

    def summarize(self, batch, ratio):
        return [self.model.summarize(text, ratio) for text in batch]
