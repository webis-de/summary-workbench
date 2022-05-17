#!/usr/bin/env python3
from sys import argv
from typing import Union

import spacy
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

MODEL = "en_core_web_md"  # if change model, also change dockerfile


class CosineSimilarity:
    def __init__(self):
        self.nlp = spacy.load(MODEL)

    def _get_sentences(self, text):
        if isinstance(text, str):
            text = text.replace("\n", " ")
            text = text.strip()
            text = list(self.nlp(text).sents)
            text = [s for s in text if any(t.is_alpha for t in s)]
        else:
            text = [self.nlp(s) for s in text]
        return text

    def evaluate(self, document, summary):
        document_sents = self._get_sentences(document)
        summary_sents = self._get_sentences(summary)
        return {
            "documentSentences": [doc_sent.text.strip() for doc_sent in document_sents],
            "summarySentences": [sum_sent.text.strip() for sum_sent in summary_sents],
            "scores": [
                [doc_sent.similarity(sum_sent) for doc_sent in document_sents]
                for sum_sent in summary_sents
            ],
        }


evaluator = CosineSimilarity()
app = FastAPI()


class Body(BaseModel):
    sentences: Union[str, list]
    summary: str


@app.post("/")
def similarity(body: Body):
    return evaluator.evaluate(body.sentences, body.summary)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(argv[1]))
