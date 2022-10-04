import spacy
from model_setup import SPACY_MODEL
from utils.aio import to_threaded


class SemanticSimilarity:
    def __init__(self):
        self.nlp = spacy.load(SPACY_MODEL)

    def _get_sentences(self, text):
        if isinstance(text, str):
            text = [s for s in self.nlp(text).sents if any(t.is_alpha for t in s)]
        else:
            text = [self.nlp(s) for s in text]
        return text

    def evaluate(self, document, summary):
        document_sents = self._get_sentences(document)
        summary_sents = self._get_sentences(summary)
        return {
            "documentSentences": [doc_sent.text_with_ws for doc_sent in document_sents],
            "summarySentences": [sum_sent.text_with_ws for sum_sent in summary_sents],
            "scores": [
                [doc_sent.similarity(sum_sent) for doc_sent in document_sents]
                for sum_sent in summary_sents
            ],
        }


evaluator = SemanticSimilarity()


@to_threaded
def semantic_similarity(sentences, summary):
    return evaluator.evaluate(sentences, summary)
