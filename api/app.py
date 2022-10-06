import os
from urllib.parse import urlparse

import uvicorn
from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from plugin_watcher import PluginWatcher
from pydantic import AnyHttpUrl, BaseModel, Field, root_validator, validator
from pymongo import MongoClient
from utils.article_download import download_article
from utils.cancel import cancel_on_disconnect
from utils.pdf import Grobid, GrobidError
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
        if isinstance(response, TimeoutError):
            raise Exception("timeout error occurred")
        if response["success"]:
            results[key] = response["data"]
        else:
            err_messages = error_to_message(response)
            errors[key] = err_messages
    return results, errors


watcher = PluginWatcher()
grobid = Grobid(host=os.environ["GROBID_HOST"])
app = FastAPI(docs_url="/api/docs", redoc_url="/api/redoc")
api = APIRouter()


def split(values, num_parts):
    size = len(values) // num_parts
    return [values[i : i + size] for i in range(0, len(values), size)]


async def evaluate(metrics, hypotheses, references):
    keys, batch = zip(*hypotheses.items())
    batch = [e for hyps in batch for e in zip(hyps, references)]
    request_args = {
        key: {
            "url": watcher.metrics[key]["url"],
            "json": {"batch": batch, **args},
            "timeout": 0,
        }
        for key, args in metrics.items()
    }
    results, errors = await plugin_request(request_args)
    results = {
        key: {k: v for k, v in zip(keys, split(value, len(keys)))}
        for key, value in results.items()
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
def startup_db_client():
    app.mongodb_client = MongoClient(os.environ["MONGODB_HOST"])
    app.database = app.mongodb_client["Feedbacks"]


@app.on_event("shutdown")
def shutdown_db_client():
    app.mongodb_client.close()


@app.on_event("startup")
async def startup_event():
    await watcher.start()


@app.on_event("shutdown")
def shutdown_db_client():
    watcher.shutdown()


@api.get("/metrics")
async def metrics():
    return watcher.metrics


@api.get("/summarizers")
async def metrics():
    return watcher.summarizers


class EvaluationBody(BaseModel):
    hypotheses: dict[str, list[str]] = Field(
        ...,
        description="A dictionary where each key is a model and each value is a list of hypotheses. Each model has to have the same number of hypothese. Each hypotheses will be compared with the corresponding entry in the reference argument.",
        example={
            "model1": ["this is a test hypotheses", "this is another test hypotheses"],
            "model2": ["this is another test hypotheses", "this is a test hypotheses"],
        },
    )
    references: list[str] = Field(
        ...,
        description="A list of reference texts. The number of references has to be the same as the number of hypotheses for each model.",
        example=["this is a test reference", "this is another test reference"],
    )
    metrics: dict[str, dict] = Field(
        ...,
        description="The selection of metrics where each key is the name of the model and each value is a dictionary that contains the arguments for the model",
        example={"metric-null-rouge": {}},
    )

    @root_validator
    def same_length(cls, values):
        references = values.get("references")
        hypotheses = values.get("hypotheses")
        if references is None or hypotheses is None:
            return values
        len_refs = len(references)
        for name, hyps in hypotheses.items():
            len_hyps = len(hyps)
            if len_hyps != len_refs:
                raise ValueError(
                    f"hypotheses {name} and references are not the same size ({len_hyps} != {len_refs})"
                )
        return values

    @validator("metrics")
    def valid_metric(cls, v):
        unknown = [e for e in v.keys() if e not in watcher.metric_keys]
        if unknown:
            raise ValueError(f"unknown metrics: {unknown}")
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
    documents: list[str] = Field(
        ...,
        min_length=1,
        description="List of documents to be summarized.",
        example=["This is the first sentence.", "This is the second sentence."],
    )
    ratio: float = Field(
        0.2,
        gt=0.0,
        lt=1.0,
        description="The number of words in the summary will be approximately 'ratio * <number of words in document>'",
    )
    split_sentences: bool = Field(
        False, description="If set, the summaries will be split into sentences."
    )
    add_metadata: bool = Field(
        False,
        description="Add additional data like the original document, the url (if given) and the title of the document (if given).",
    )
    summarizers: dict[str, dict] = Field(
        ...,
        description="The selection of summarizers where each key is the name of the model and each value is a dictionary that contains the arguments for the model",
        example={"summarizer-null-textrank": {}},
    )

    @validator("summarizers")
    def valid_summarizers(cls, v):
        unknown = [e for e in v.keys() if e not in watcher.summarizer_keys]
        if unknown:
            raise ValueError(f"unknown summarizers: {unknown}")
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
        return await grobid.extract_pdf(await request.body())
    except GrobidError as e:
        return {"error": str(e)}


class SemanticSimilarityBody(BaseModel):
    sentences: str
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
async def feedback(request: Request, body: FeedbackBody):
    request.app.database["feedback"].insert_one(body.dict())


@app.get("/health")
async def health():
    return Response()


app.include_router(api, prefix="/api")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc):
    errors = exc.errors()
    for entry in errors:
        entry["loc"] = list(entry["loc"][1:])
    return JSONResponse(
        {"errors": error_to_message({"error": "VALIDATION", "errors": errors})},
        status_code=422,
    )


@app.exception_handler(Exception)
async def general_exception_handler(_, exc):
    return JSONResponse({"errors": [str(exc)]}, status_code=500)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
