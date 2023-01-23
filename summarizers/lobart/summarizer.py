import math
from asyncio.log import logger

import torch
import transformers
from localattn import LoBART
from model_setup import MODEL_PATH, URL_PODCAST_MODEL
from transformers import BartTokenizer


class LoBARTModel(object):
    def __init__(self):
        print("Transformers version : ", transformers.__version__)
        self.metadata = {"model": URL_PODCAST_MODEL}
        self.tokenizer = BartTokenizer.from_pretrained("facebook/bart-large")
        self.window_width = 512
        self.attention_window = [self.window_width] * 12
        self.multi_input_span = 4
        self.model = LoBART.from_pretrained("facebook/bart-large-cnn")
        self.model.swap_fullattn_to_localattn(attention_window=self.attention_window)
        self.model.expand_learned_embed_positions(
            multiple=self.multi_input_span, cut=self.multi_input_span * 2
        )
        state = torch.load(MODEL_PATH, map_location=torch.device("cpu"))
        model_state_dict = state["model"]
        self.model.load_state_dict(model_state_dict)
        if self.model:
            logger.info("LoBART initialized.")
        else:
            logger.error("Failed to initialize LoBART model.")

    def summarize(self, text: str = None, ratio: float = 0.2):
        token_ids = self.tokenizer.batch_encode_plus(
            [text],
            return_tensors="pt",
            max_length=self.model.config.max_position_embeddings,
            pad_to_max_length=True,
        )["input_ids"]
        # LoBART parameters for decoding taken from the paper
        num_beams = 4
        length_penalty = 2.0
        no_repeat_ngram_size = 3
        tolerance = 0.1
        if ratio > 0.5:
            ratio = 0.5
        requested_length = len(text.split()) * ratio
        min_length = math.floor((1 - tolerance) * requested_length)
        max_length = max(math.floor((1 + tolerance) * requested_length), 16)
        summary_ids = self.model.generate(
            token_ids,
            num_beams=num_beams,
            length_penalty=length_penalty,
            max_length=max_length,
            min_length=min_length,
            no_repeat_ngram_size=no_repeat_ngram_size,
        )
        summary_text = self.tokenizer.decode(
            summary_ids.squeeze(), skip_special_tokens=True
        ).strip()
        return summary_text


class SummarizerPlugin:
    def __init__(self):
        print("Initializing LoBART")
        self.summarizer = LoBARTModel()

    def summarize(self, batch, ratio):
        return [self.summarizer.summarize(text, ratio) for text in batch]

    def metadata(self):
        return self.summarizer.metadata
