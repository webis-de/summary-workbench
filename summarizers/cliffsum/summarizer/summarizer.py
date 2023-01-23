import os
import tarfile
from pathlib import Path

from huggingface_hub.utils import HFValidationError
from transformers import (PegasusForConditionalGeneration,
                          PegasusTokenizerFast, pipeline)

from .download import get_stream
from .transformer_summarizer import TransformerSummarizer


def is_within_directory(directory, target):
    abs_directory = os.path.abspath(directory)
    abs_target = os.path.abspath(target)
    prefix = os.path.commonprefix([abs_directory, abs_target])
    return prefix == abs_directory


def safe_extract(tar, path=".", members=None, *, numeric_owner=False):
    for member in tar.getmembers():
        member_path = os.path.join(path, member.name)
        if not is_within_directory(path, member_path):
            raise Exception("Attempted Path Traversal in Tar File")
    tar.extractall(path, members, numeric_owner=numeric_owner)


class CliffSum(object):
    def __init__(self, checkpoint_path, url):
        self.checkpoint_path = Path(checkpoint_path)
        try:
            self.tokenizer, self.model = self.load()
        except (OSError, HFValidationError):
            with tarfile.open(fileobj=get_stream(url), mode="r|gz") as file:
                safe_extract(file, path=checkpoint_path.parent)
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
