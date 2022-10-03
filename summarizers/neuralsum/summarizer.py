import math
import os
import sys
import warnings

from transformers import AutoTokenizer, pipeline

if not sys.warnoptions:
    warnings.simplefilter("ignore")

MODEL = os.environ["model"]


def add_dot(text):
    if text[-1] != ".":
        return text + "."
    return text


class NeuralSummarizer(object):
    MODELS = {
        "T5-Base": {"model": "t5-base"},
        "BART-CNN": {"model": "facebook/bart-large-cnn"},
        "BART-XSum": {"model": "facebook/bart-large-xsum"},
        "Pegasus-CNN": {"model": "google/pegasus-cnn_dailymail"},
        "Pegasus-XSum": {"model": "google/pegasus-xsum"},
    }

    def __init__(self, model: str = "T5-Base"):
        """Initiates a summarization pipeline using the Huggingface transformers library (https://github.com/huggingface/transformers).
        This pipeline takes a summarization model as input, and returns the summary. To force the model to generate longer summaries, we set the min_length parameter of the pipeline to our desired summary length ratio. List of supported summarization models can be found herE:
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
        self.model = self.metadata["model"]
        self.pipeline = pipeline("summarization", model=self.model)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model)

    def _decode(self, tokens):
        return self.tokenizer.decode(tokens, skip_special_tokens=True)

    def _split(self, text):
        tokenize_result = self.tokenizer(
            text,
            add_special_tokens=True,
            padding=True,
            return_tensors="pt",
            truncation=True,
            return_overflowing_tokens=True,
            return_attention_mask=True,
        )
        token_chunks = tokenize_result.input_ids
        length = tokenize_result.attention_mask.sum(axis=1).tolist()
        text_chunks = [self._decode(chunk) for chunk in token_chunks]
        return list(zip(text_chunks, length))

    def _summarize_chunk(self, text, length, ratio, tolerance=0.1):
        if ratio > 0.5:
            ratio = 0.5
        if length < 5:  # too short inputs may give errors
            return ""
        requested_length = ratio * length
        max_length = max(
            math.floor((1 + tolerance) * requested_length), 16
        )  # short max_length will give error for short inputs
        min_length = math.floor((1 - tolerance) * requested_length)

        summary = self.pipeline(
            text,
            min_length=min_length,
            max_length=max_length,
            clean_up_tokenization_spaces=True,
        )[0]["summary_text"]
        return summary

    def summarize(self, text: str = None, ratio: float = 0.2):
        """Currently used models cannot process sequences longer than 1024 tokens. Thus, truncate the text to appropriate number of tokens."""
        chunks = self._split(text)

        # don't summarize last chunk if too short
        if len(chunks) > 1 and chunks[-1][1] < 50:
            chunks.pop()

        summaries = [
            self._summarize_chunk(text, length, ratio) for text, length in chunks
        ]
        summaries = [s.replace("<n>", " ").replace("\n", " ") for s in summaries]
        summaries = [s.strip() for s in summaries]
        summaries = [add_dot(s) for s in summaries if s]
        return " ".join(summaries)


class SummarizerPlugin:
    def __init__(self):
        self.summarizer = NeuralSummarizer(MODEL)

    def summarize(self, batch, ratio):
        return [self.summarizer.summarize(text, ratio) for text in batch]

    def metadata(self):
        return self.summarizer.metadata
