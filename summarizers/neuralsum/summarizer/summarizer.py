from transformers import AutoTokenizer, pipeline

from .transformer_summarizer import TransformerSummarizer


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
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_id)
        self.pipeline = pipeline(
            "summarization", model=self.model_id, tokenizer=self.tokenizer
        )
        self.chunker = TransformerSummarizer(
            generator=self.pipeline,
            tokenizer=self.tokenizer,
            prompt_tokens=self.metadata.get("prompt_tokens", 0),
            default_arguments={"do_sample": True, "repetition_penalty": 1.2},
        )

    def summarize(self, text: str, *, use_contrastive_search: bool, ratio: float = 0.2):
        return self.chunker(
            text,
            use_contrastive_search=use_contrastive_search,
            ratio=ratio,
        )
