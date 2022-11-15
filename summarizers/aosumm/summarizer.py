import math
import re

import torch
from pydantic import Field
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

word_re = re.compile(r"[^\s]+")


def get_length(tokenized, ratio, tolerance=0.1):
    length = tokenized.attention_mask.sum()
    requested_length = ratio * length
    max_length = max(math.floor((1 + tolerance) * requested_length), 16)
    min_length = math.floor((1 - tolerance) * requested_length)
    return max_length, min_length


class Generator:
    def __init__(self, model_name):
        self.model_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_name, tokenizer_file=None
        )
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
        self.model.eval()

    def summarize(self, document, keywords, ratio):
        keywords = word_re.findall(keywords)
        keywords = " | ".join(keywords)
        text = f"{keywords} - {document}"
        tokenized = self.tokenizer(
            text,
            add_special_tokens=True,
            padding=True,
            return_tensors="pt",
            truncation=True,
            return_attention_mask=True,
        )
        max_length, min_length = get_length(tokenized, ratio)

        with torch.no_grad():
            (gen,) = self.model.generate(
                **tokenized,
                do_sample=True,
                repetition_penalty=1.2,
                max_length=max_length,
                min_length=min_length,
            )
        return self.tokenizer.decode(gen, skip_special_tokens=True)


MODEL = "hyunwoongko/ctrlsum-cnndm"


class SummarizerPlugin:
    def __init__(self):
        self.model = Generator(MODEL)
        self.meta = {"model": self.model.model_name}

    def summarize(self, batch, ratio, keywords: str = Field(..., min_length=1)):
        return [self.model.summarize(text, keywords, ratio) for text in batch]

    def metadata(self):
        return self.meta
