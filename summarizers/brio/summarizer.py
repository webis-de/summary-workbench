import math
from os import environ

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


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

    def summarize(self, document, ratio):
        tokenized = self.tokenizer(
            document,
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


MODELS = {
    "CNNDM-uncased": "Yale-LILY/brio-cnndm-uncased",
    "CNNDM-cased": "Yale-LILY/brio-cnndm-cased",
    "XSUM-cased": "Yale-LILY/brio-xsum-cased",
}


MODEL = environ.get("model") or "CNNDM-uncased"


class SummarizerPlugin:
    def __init__(self):
        self.model = Generator(MODELS[MODEL])
        self.meta = {"model": self.model.model_name}

    def summarize(self, batch, ratio):
        return [self.model.summarize(text, ratio) for text in batch]

    def metadata(self):
        return self.meta
