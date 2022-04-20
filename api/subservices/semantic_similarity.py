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

    def evaluate(self, sentences, summary):
        if isinstance(sentences, str):
            sentences = sentences.replace("\n", " ")
            sentences = sentences.strip()
            sentences = list(self.nlp(sentences).sents)
            sentences = [s for s in sentences if any(t.is_alpha for t in s)]
        else:
            sentences = [self.nlp(s) for s in sentences]
        summary_doc = self.nlp(summary)
        scores = [
            [sentence.text.strip(), sentence.similarity(summary_doc)]
            for sentence in sentences
        ]
        return scores


evaluator = CosineSimilarity()
app = FastAPI()


class Body(BaseModel):
    sentences: Union[str, list]
    summary: str


@app.post("/")
def similarity(body: Body):
    scores = evaluator.evaluate(body.sentences, body.summary)
    return {"socres": scores}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(argv[1]))
