import math
import os
import re
import sys
import warnings

from transformers import AutoTokenizer, pipeline

space_re = re.compile("\s+")

if not sys.warnoptions:
    warnings.simplefilter("ignore")


def chunk(tokenizer, text, prompt_tokens=0):
    text = space_re.sub(" ", text)
    max_length = tokenizer.model_max_length - prompt_tokens
    tokenize_result = tokenizer(
        text,
        add_special_tokens=True,
        max_length=max_length,
        padding=True,
        return_tensors="pt",
        truncation=True,
        return_overflowing_tokens=True,
        return_attention_mask=True,
    )
    token_chunks = tokenize_result.input_ids
    length = tokenize_result.attention_mask.sum(axis=1).tolist()
    text_chunks = [
        tokenizer.decode(chunk, skip_special_tokens=True) for chunk in token_chunks
    ]
    return list(zip(text_chunks, length))


def filter_chunks(chunks, max_length):
    # too short inputs may give errors
    chunks = [chunk for chunk in chunks if chunk[1] > 10]
    # don't summarize last chunk if too short
    if len(chunks) > 1 and chunks[-1][1] < max_length / 10:
        chunks = chunks[:-1]
    return chunks


def length_to_parameters(length, tolerance=0.1, min_max_length=16):
    return {
        "max_length": max(math.floor((1 + tolerance) * length), min_max_length),
        "min_length": math.floor((1 - tolerance) * length),
    }


class NeuralSummarizer(object):
    MODELS = {
        "T5-Base": {"model": "t5-base", "prompt_tokens": 2},
        "BART-CNN": {"model": "facebook/bart-large-cnn"},
        "BART-XSum": {"model": "facebook/bart-large-xsum"},
        "Pegasus-CNN": {"model": "google/pegasus-cnn_dailymail"},
        "Pegasus-XSum": {"model": "google/pegasus-xsum"},
    }

    def __init__(self, model: str = "T5-Base"):
        """Initiates a summarization pipeline using the Huggingface transformers
        library (https://github.com/huggingface/transformers).
        This pipeline takes a summarization model as input, and returns the summary.
        To force the model to generate longer summaries, we set the min_length parameter
        of the pipeline to our desired summary length ratio.
        List of supported summarization models can be found here:
            https://huggingface.co/models?filter=summarization

        For our demo, we use the following models denoted as {'model name': 'model code'}
        {
         'T5-Base': 't5-base',
         'BART-CNN': 'facebook/bart-large-cnn',
         'BART-XSum': 'facebook/bart-large-xsum',
         'Pegasus-CNN': 'google/pegasus-cnn_dailymail',
         'Pegasus-XSum': 'google/pegasus-xsum',
        }

        Args:
            model (str, optional): [summarization model]. Defaults to 't5-base'.
        """
        self.metadata = self.MODELS[model]
        self.model_id = self.metadata["model"]
        self.prompt_tokens = self.metadata.get("prompt_tokens", 0)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_id)
        self.pipeline = pipeline(
            "summarization", model=self.model_id, tokenizer=self.tokenizer
        )

    def summarize_chunk(self, chunk, ratio):
        text, length = chunk
        return self.pipeline(
            text,
            **length_to_parameters(length * ratio),
            clean_up_tokenization_spaces=True,
        )[0]["summary_text"]

    def summarize(self, text: str, ratio: float = 0.2):
        if ratio > 0.5:
            ratio = 0.5
        chunks = chunk(self.tokenizer, text, prompt_tokens=self.prompt_tokens)
        chunks = filter_chunks(chunks, self.tokenizer.model_max_length)

        summaries = [self.summarize_chunk(chunk, ratio) for chunk in chunks]
        summaries = [s.replace(".<n>", ". ") for s in summaries]
        summaries = [space_re.sub(" ", s) for s in summaries]
        summaries = [s.strip() for s in summaries]
        summaries = [f"{s}." if not s.endswith(".") else s for s in summaries if s]
        return " ".join(summaries)


class SummarizerPlugin:
    def __init__(self, *, model=None):
        self.model = model or os.environ["model"]
        self.summarizer = NeuralSummarizer(self.model)

    def summarize(self, batch, ratio):
        return [self.summarizer.summarize(text, ratio) for text in batch]

    def metadata(self):
        return self.summarizer.metadata
