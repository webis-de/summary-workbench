#!/usr/bin/env python3
import asyncio
from sys import argv

import nltk
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

nltk.download("punkt")

app = FastAPI()


class Body(BaseModel):
    text: str


def split_sentences(text):
    return nltk.sent_tokenize(text)


@app.post("/")
async def download(body: Body):
    sentences = await asyncio.get_event_loop().run_in_executor(
        None, split_sentences, body.text
    )
    return {"sentences": sentences}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(argv[1]))
