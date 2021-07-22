import os

from transformers import (AutoModelForSeq2SeqLM, AutoTokenizer,
                          EncoderDecoderModel, LongformerTokenizer, pipeline)

MODEL = os.environ["model"]


class NeuralSummarizer(object):
    MODELS = {
        "T5": "t5-base",
        "BART-CNN": "facebook/bart-large-cnn",
        "BART-XSum": "facebook/bart-large-xsum",
        "Pegasus-CNN": "google/pegasus-cnn_dailymail",
        "Pegasus-XSum": "google/pegasus-xsum",
        "Longformer2Roberta": "patrickvonplaten/longformer2roberta-cnn_dailymail-fp16",
    }

    def __init__(self, model: str = "T5"):
        """Initiates a summarization pipeline using the Huggingface transformers library (https://github.com/huggingface/transformers).
        This pipeline takes a summarization model as input, and returns the summary. To force the model to generate longer summaries, we set the min_length parameter of the pipeline to our desired summary length ratio. List of supported summarization models can be found herE:
        https://huggingface.co/models?filter=summarization

        For our demo, we use the following models denoted as {'model name': 'model code'}
        {
         'T5': 't5-base',
         'BART-CNN': 'facebook/bart-large-cnn',
         'BART-XSum': 'facebook/bart-large-xsum',
         'Pegasus-CNN': 'google/pegasus-cnn_dailymail',
         'Pegasus-XSum': 'google/pegasus-xsum',
         'Longformer2Roberta': 'patrickvonplaten/longformer2roberta-cnn_dailymail-fp16'
        }

        Args:
            model (str, optional): [summarization model]. Defaults to 't5-base'.
        """
        self.model = self.MODELS[model]
        self.tokenizer = None
        self.encoder_decoder = None
        self.pipeline = None
        if self.model != "patrickvonplaten/longformer2roberta-cnn_dailymail-fp16":
            self.pipeline = pipeline("summarization", model=self.model)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model)
        else:
            self.encoder_decoder = EncoderDecoderModel.from_pretrained(
                "patrickvonplaten/longformer2roberta-cnn_dailymail-fp16"
            )
            self.tokenizer = LongformerTokenizer.from_pretrained(
                "allenai/longformer-base-4096"
            )

    def _truncate_text(self, text, remove_extra_tokens=0):
        for i in range(3):
            tokens = self.tokenizer(
                text, return_tensors="pt", truncation=True
            ).input_ids
            max_model_length = tokens.size()[1]
            truncated_tokens = tokens[0][: max_model_length - remove_extra_tokens]
            text = self.tokenizer.decode(
                truncated_tokens, clean_up_tokenization_spaces=True
            )
            without_truncate_length = self.tokenizer(
                text, return_tensors="pt"
            ).input_ids.size()[1]
            if max_model_length >= without_truncate_length:
                return tokens, text
        return self._truncate_text(text, remove_extra_tokens=remove_extra_tokens + 3)

    def summarize(self, text: str = None, ratio: float = 0.2):
        """Currently used models cannot process sequences longer than 1024 tokens. Thus, truncate the text to appropriate number of tokens."""
        tokens, truncated_text = self._truncate_text(text)
        min_summary_length = round(len(truncated_text.split()) * ratio)

        if self.pipeline:
            summarization = self.pipeline(
                truncated_text,
                min_length=min_summary_length,
                clean_up_tokenization_spaces=True,
            )
            summary_text = summarization[0]["summary_text"]
            return summary_text

        if self.encoder_decoder:
            output_ids = self.encoder_decoder.generate(
                tokens, min_length=min_summary_length
            )
            summary_text = self.tokenizer.decode(
                output_ids[0], skip_special_tokens=True
            )
            return summary_text


class SummarizerPlugin:
    def __init__(self):
        self.summarizer = NeuralSummarizer(MODEL)

    def summarize(self, *args, **kwargs):
        return self.summarizer.summarize(*args, **kwargs)
