import pytextrank
import spacy


def take_ratio(ranked_sents, ratio):
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


def order_sentences(ranked_sents, original_sents):
    return [s for s in original_sents if s in ranked_sents]


class SummarizerPlugin:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.nlp.add_pipe("textrank")

    def summarize(self, text, ratio):
        doc = self.nlp(text)
        ranked_sents = doc._.textrank.summary(
            limit_phrases=128,
            limit_sentences=len(list(doc.sents)),
            preserve_order=False,
        )
        ranked_sents = take_ratio(ranked_sents, ratio)
        ranked_sents = order_sentences(ranked_sents, doc.sents)
        return " ".join(map(str, ranked_sents))
