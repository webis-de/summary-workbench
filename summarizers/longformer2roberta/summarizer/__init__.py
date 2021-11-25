import math

from transformers import EncoderDecoderModel, LongformerTokenizer

MAX_POSITION_EMBEDDINGS = 512


class Longformer2RobertaSummarizer:
    def __init__(self):
        self.encoder_decoder = EncoderDecoderModel.from_pretrained(
            "patrickvonplaten/longformer2roberta-cnn_dailymail-fp16"
        )
        self.tokenizer = LongformerTokenizer.from_pretrained(
            "allenai/longformer-base-4096"
        )

    def summarize(self, text: str = None, ratio: float = 0.2, tolerance=0.1):
        """The maximum input size is 4096 tokens and the maximum output size is 512 tokens."""
        tokens = self.tokenizer(
            text,
            add_special_tokens=True,
            return_tensors="pt",
            truncation=True,
            return_overflowing_tokens=False,
            return_attention_mask=False,
        ).input_ids

        length = tokens.shape[1]
        if length < 5:  # too short inputs may give errors
            return ""
        requested_length = ratio * length
        requested_length = min(
            requested_length, MAX_POSITION_EMBEDDINGS
        )  # too long output length will give error
        max_length = min(
            max(math.floor((1 + tolerance) * requested_length), 20),
            MAX_POSITION_EMBEDDINGS,
        )
        min_length = math.floor((1 - tolerance) * requested_length)

        output_ids = self.encoder_decoder.generate(
            tokens, min_length=min_length, max_length=max_length
        )
        summary = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
        summary = summary.replace("\n", " ")
        return summary


class SummarizerPlugin:
    def __init__(self):
        self.summarizer = Longformer2RobertaSummarizer()

    def summarize(self, *args, **kwargs):
        return self.summarizer.summarize(*args, **kwargs)
