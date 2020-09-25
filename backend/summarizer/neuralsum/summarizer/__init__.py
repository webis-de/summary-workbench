from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM, EncoderDecoderModel, LongformerTokenizer


class NeuralSummarizer(object):
    MODEL = 't5-base'

    def __init__(self, model: str = 't5-base'):
        """Initiates a summarization pipeline using the Huggingface transformers library (https://github.com/huggingface/transformers).
        This pipeline takes a summarization model as input, and returns the summary. To force the model to generate longer summaries, we set the min_length parameter of the pipeline to our desired summary length ratio. List of supported summarization models can be found herE:
        https://huggingface.co/models?filter=summarization

        For our demo, we use the following models denoted as {'model name': 'model code'}
        {
         'T5': 't5-base',
         'BART': 'facebook/bart-large-cnn',
         'Pegasus': 'google/pegasus-cnn_dailymail',
         'Longformer2Roberta': 'patrickvonplaten/longformer2roberta-cnn_dailymail-fp16'
        }

        Args:
            model (str, optional): [summarization model]. Defaults to 't5-base'.
        """
        self.model = model
        self.tokenizer = None
        self.encoder_decoder = None
        self.pipeline = None
        if self.model != 'patrickvonplaten/longformer2roberta-cnn_dailymail-fp16':
            self.pipeline = pipeline('summarization', model=self.model)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model)
        else:
            self.encoder_decoder = EncoderDecoderModel.from_pretrained("patrickvonplaten/longformer2roberta-cnn_dailymail-fp16")
            self.tokenizer = LongformerTokenizer.from_pretrained("allenai/longformer-base-4096")


    def summarize(self, text: str = None, ratio: float = 0.2):

        """Currently used models cannot process sequences longer than 1024 tokens. Thus, truncate the text to appropriate number of tokens.
        """
        tokens = self.tokenizer(text, return_tensors="pt", truncation=True).input_ids
        max_model_length = tokens.size()[1]
        truncated_tokens = tokens[0][:max_model_length-3]
        truncated_text = self.tokenizer.decode(truncated_tokens, clean_up_tokenization_spaces=True)
        min_summary_length = round(len(truncated_text.split()) * ratio)

        if self.pipeline:
            summarization = self.pipeline(truncated_text, min_length=min_summary_length, clean_up_tokenization_spaces=True)
            summary_text = summarization[0]['summary_text']
            return summary_text

        if self.encoder_decoder:
            output_ids = self.encoder_decoder.generate(tokens, min_length=min_summary_length)
            summary_text = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
            return summary_text

