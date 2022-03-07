#!/usr/bin/env python3
from sys import argv

import nltk
import uvicorn
from fastapi import FastAPI
from newspaper import Article
from pydantic import BaseModel

nltk.download("punkt")

app = FastAPI()


class Body(BaseModel):
    url: str


def download_article(url):
    article = Article(url)
    article.download()
    article.parse()
    return article


@app.post("/")
def download(body: Body):
    article = download_article(body.url)
    return {"text": article.text, "title": article.title}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(argv[1]))
