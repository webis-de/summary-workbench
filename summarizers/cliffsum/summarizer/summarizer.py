import os
import tarfile
from pathlib import Path

from huggingface_hub.utils import HFValidationError
from transformers import (PegasusForConditionalGeneration,
                          PegasusTokenizerFast, pipeline)

from .download import get_stream
from .transformer_summarizer import TransformerSummarizer


class CliffSum(object):
    def __init__(self, checkpoint_path, url):
        self.checkpoint_path = Path(checkpoint_path)
        try:
            self.tokenizer, self.model = self.load()
        except (OSError, HFValidationError):
            with tarfile.open(fileobj=get_stream(url), mode="r|gz") as tar:
                tar.extractall(path=checkpoint_path.parent)
            self.tokenizer, self.model = self.load()
        self.pipeline = pipeline(
            "summarization", model=self.model, tokenizer=self.tokenizer
        )
        self.chunker = TransformerSummarizer(
            generator=self.pipeline,
            tokenizer=self.tokenizer,
            default_arguments={"do_sample": True, "repetition_penalty": 1.2},
        )
        if not (self.tokenizer and self.model and self.pipeline):
            raise ValueError("Model initialization failed")

    def load(self):
        tokenizer = PegasusTokenizerFast.from_pretrained(
            self.checkpoint_path, local_files_only=True
        )
        model = PegasusForConditionalGeneration.from_pretrained(
            self.checkpoint_path, local_files_only=True
        )
        return tokenizer, model

    def summarize(self, text: str, *, use_contrastive_search: bool, ratio: float = 0.2):
        return self.chunker(
            text,
            use_contrastive_search=use_contrastive_search,
            ratio=ratio,
        )
