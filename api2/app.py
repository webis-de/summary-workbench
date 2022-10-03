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


def _error_to_message(error):
    errors = []
    if isinstance(error, str):
        error = {"message": error}
    error_type = error.get("error", "UNKNOWN")
    if error_type == "VALIDATION":
        for e in error["errors"]:
            loc = e["loc"]
            msg = e["msg"]
            message = f"{loc}: {msg}"
            errors.append({"type": error_type, "message": message})
    else:
        message = error["message"]
        errors.append({"type": error_type, "message": message})
    return errors


def error_to_message(errors):
    if not isinstance(errors, list):
        errors = [errors]
    errors = [err for e in errors for err in _error_to_message(e)]
    return errors


async def plugin_request(plugins):
    keys, request_data = zip(*plugins.items())
    responses = await request(request_data)
    results = {}
    errors = {}
    for key, response in zip(keys, responses):
        if response["success"]:
            results[key] = response["data"]
        else:
            err_messages = error_to_message(response)
            errors[key] = err_messages
    # TODO: implement cache
    return results, errors


watcher = PluginWatcher()
app = FastAPI()
api = APIRouter()


async def evaluate(metrics, hypotheses, references):
    keys, batch = zip(*hypotheses.items())
    request_args = {
        key: {
            "url": watcher.metrics[key]["url"],
            "json": {"batch": batch, "references": references, **args},
        }
        for key, args in metrics.items()
    }
    results, errors = await plugin_request(request_args)
    results = {
        key: {k: v for k, v in zip(keys, value)} for key, value in results.items()
    }
    return results, errors


async def summarize(summarizers, documents, ratio):
    request_args = {
        key: {
            "url": watcher.summarizers[key]["url"],
            "json": {"batch": documents, "ratio": ratio, **args},
        }
        for key, args in summarizers.items()
    }
    results, errors = await plugin_request(request_args)
    return results, errors


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
    hypotheses: dict[str, list[str]]
    references: list[str]
    metrics: dict[str, dict]

    @root_validator
    def same_length(cls, values):
        references = values.get("references")
        hypotheses = values.get("hypotheses")
        if references is None or hypotheses is None:
            return values
        len_refs = len(references)
        for name, hyps in hypotheses.items():
            len_hyps = len(hyps)
            assert (
                len_hyps == len_refs
            ), f"hypotheses {name} and references are not the same size ({len_hyps} != {len_refs})"
        return values

    @validator("metrics")
    def valid_metric(cls, v):
        assert all(e in watcher.metric_keys for e in v.keys())
        return v


@api.post("/evaluate")
@cancel_on_disconnect
async def evaluate_route(request: Request, body: EvaluationBody):
    results, errors = await evaluate(body.metrics, body.hypotheses, body.references)
    data = {"scores": results}
    if errors:
        data["errors"] = errors
    return {"data": data}


class SummarizeBody(BaseModel):
    documents: list[str] = Field(..., min_length=1)
    ratio: float = Field(0.2, gt=0.0, lt=1.0)
    split_sentences: bool = False
    add_metadata: bool = False
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


async def sentence_split_multiple(texts):
    return [await sentence_split(text) for text in texts]


@api.post("/summarize")
@cancel_on_disconnect
async def summarize_route(request: Request, body: SummarizeBody):
    documents = []
    metadata = []
    for text in body.documents:
        text = text.strip()
        if is_url(text):
            meta = await download_article(text)
            meta["url"] = text
            text = meta["text"]
            del meta["text"]
        else:
            meta = {}
        documents.append(text)
        if body.add_metadata:
            if body.split_sentences:
                text = await sentence_split(text)
            meta["document"] = text
        metadata.append(meta)
    results, errors = await summarize(body.summarizers, documents, body.ratio)
    if body.split_sentences:
        new_results = {}
        for key, value in results.items():
            if isinstance(value, list):
                value = await sentence_split_multiple(value)
            new_results[key] = value
        results = new_results
    if results:
        keys, values = list(zip(*results.items()))
    else:
        keys, values = [], []
    summaries = []
    for e, meta in zip(zip(*values), metadata):
        content = {"summaries": dict(zip(keys, e))}
        if body.add_metadata:
            content["metadata"] = meta
        summaries.append(content)
    data = {"summaries": summaries}
    if errors:
        data["errors"] = errors
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
