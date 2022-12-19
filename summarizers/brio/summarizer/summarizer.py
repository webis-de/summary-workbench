from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from .transformer_summarizer import TransformerSummarizer


class Generator:
    def __init__(self, model_name):
        self.model_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_name, tokenizer_file=None
        )
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
        self.model.eval()
        self.chunker = TransformerSummarizer(
            generator=self.model,
            tokenizer=self.tokenizer,
            default_arguments={"do_sample": True, "repetition_penalty": 1.2},
        )

    def summarize(self, text: str, *, use_contrastive_search: bool, ratio: float = 0.2):
        return self.chunker(
            text,
            use_contrastive_search=use_contrastive_search,
            ratio=ratio,
        )
