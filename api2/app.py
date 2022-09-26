from urllib.parse import urlparse

import uvicorn
from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from plugin_watcher import PluginWatcher
from pydantic import AnyHttpUrl, BaseModel, Field, root_validator, validator
from utils.article_download import download_article
from utils.cancel import cancel_on_disconnect
from utils.pdf import GrobidError, extract_pdf
from utils.request import request
from utils.semantic import semantic_similarity
from utils.sentence import sentence_split


def is_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False


METRICS = {}


def error_to_message(error):
    pass


async def plugin_request(plugins):
    keys, request_data = zip(*plugins.items())
    responses = await request(request_data)
    results = {}
    errors = {}
    for key, response in zip(keys, responses):
        if isinstance(response, Exception):
            err_messages = error_to_message(response)
            errors[key] = err_messages
            # TODO: add more error handling
        else:
            results[key] = response
    # TODO: implement cache
    return results, errors


watcher = PluginWatcher()
app = FastAPI()
api = APIRouter()


async def evaluate(metrics, hypotheses, references):
    request_args = {
        key: {
            "url": watcher.metrics[key]["url"],
            "json": {"hypotheses": hypotheses, "references": references, **args},
        }
        for key, args in metrics.items()
    }
    results, errors = await plugin_request(request_args)
    results = {key: {"scores": value["scores"]} for key, value in results.items()}
    return results | errors


async def summarize(summarizers, text, ratio):
    request_args = {
        key: {
            "url": watcher.summarizers[key]["url"],
            "json": {"text": text, "ratio": ratio, **args},
        }
        for key, args in summarizers.items()
    }
    results, errors = await plugin_request(request_args)
    results = {key: {"summary": value["summary"]} for key, value in results.items()}
    return results | errors


@app.on_event("startup")
async def startup_event():
    await watcher.start()


@api.get("/metrics")
async def metrics():
    return watcher.metrics


@api.get("/summarizers")
async def metrics():
    return watcher.summarizers


class EvaluationBody(BaseModel):
    hypotheses: list[str]
    references: list[str]
    metrics: dict[str, dict]

    @root_validator
    def same_length(cls, values):
        len_hyps = len(values["hypotheses"])
        len_refs = len(values["references"])
        assert (
            len_hyps == len_refs
        ), f"hypotheses and references are not the same size ({len_hyps} != {len_refs})"
        return values

    @validator("metrics")
    def valid_metric(cls, v):
        assert all(e in watcher.metric_keys for e in v.keys())
        return v


@api.post("/evaluate")
@cancel_on_disconnect
async def evaluate_route(request: Request, body: EvaluationBody):
    return {
        "data": {
            "scores": await evaluate(body.metrics, body.hypotheses, body.references)
        }
    }


class SummarizeBody(BaseModel):
    text: str
    ratio: float = Field(0.2, gt=0.0, lt=1.0)
    summarizers: dict[str, dict]

    @validator("summarizers")
    def valid_summarizers(cls, v):
        assert all(e in watcher.summarizer_keys for e in v.keys())
        return v


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@api.post("/summarize")
@cancel_on_disconnect
async def summarize_route(request: Request, body: SummarizeBody):
    text = body.text
    if is_url(text):
        url = text
        text = await download_article(text)
    else:
        url = None
    text = text.strip()
    summaries = await summarize(body.summarizers, text, body.ratio)
    for value in summaries.values():
        if isinstance(value["summary"], str):
            value["summary"] = await sentence_split(value["summary"])
    original = {"text": await sentence_split(text)}
    if url is not None:
        original["url"] = url
    result = {"data": {"original": original, "summaries": summaries}}
    return result


class BulkSummarizeBody(BaseModel):
    documents: list[str]
    ratio: float = Field(0.2, gt=0.0, lt=1.0)
    summarizers: dict[str, dict]

    @validator("summarizers")
    def valid_summarizers(cls, v):
        assert all(e in watcher.summarizer_keys for e in v.keys())
        return v


def join(l):
    if isinstance(l, list):
        return " ".join(l)
    return l


@api.post("/summarize/bulk")
@cancel_on_disconnect
async def bulk_summarize_route(request: Request, body: BulkSummarizeBody):
    data = []
    for doc in body.documents:
        doc = doc.strip()
        summaries = await summarize(body.summarizers, doc, body.ratio)
        summaries = {
            key: {**value, "summary": join(value["summary"])}
            for key, value in summaries.items()
        }
        data.append({"document": doc, "summaries": summaries})
    return {"data": data}


@api.post("/pdf/extract")
@cancel_on_disconnect
async def pdf_extract(request: Request):
    assert (
        request.headers.get("content-type") == "application/pdf"
    ), f"{request.content_type} is invalid, it should be application/pdf"
    try:
        return await extract_pdf(await request.body())
    except GrobidError as e:
        return {"error": str(e)}


class SemanticSimilarityBody(BaseModel):
    sentences: list[str]
    summary: str


@api.post("/semantic_similarity")
async def semantic_similarity_route(body: SemanticSimilarityBody):
    return await semantic_similarity(body.sentences, body.summary)


class FeedbackBody(BaseModel):
    summarizer: str
    summary: str
    reference: str
    url: AnyHttpUrl | None
    feedback: str


@api.post("/feedback")
async def feedback(body: FeedbackBody):
    pass


@app.get("/health")
async def health():
    return Response()


app.include_router(api, prefix="/api")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
