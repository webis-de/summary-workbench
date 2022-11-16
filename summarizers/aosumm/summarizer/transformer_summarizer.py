import re

from transformers.pipelines import SummarizationPipeline

space_re = re.compile("\s+")


class TransformerSummarizer:
    def __init__(
        self, *, generator, tokenizer, prompt_tokens=0, default_arguments=None
    ):
        self.generator = generator
        self.tokenizer = tokenizer
        self.max_length = self.tokenizer.model_max_length - prompt_tokens
        self.default_arguments = default_arguments

    def get_arguments(
        self,
        *,
        use_contrastive_search,
        desired_length,
        tolerance=0.1,
        min_max_length=16,
    ):
        arguments = {}
        if use_contrastive_search:
            arguments["penalty_alpha"] = 0.6
            arguments["top_k"] = 4
        elif self.default_arguments:
            arguments.update(self.default_arguments)
        arguments["max_length"] = max(
            int((1 + tolerance) * desired_length), min_max_length
        )
        arguments["min_length"] = int((1 - tolerance) * desired_length)
        return arguments

    def decode(self, tokens):
        return self.tokenizer.decode(tokens, skip_special_tokens=True)

    def chunk(self, text, *, prompt_size):
        text = space_re.sub(" ", text).strip()
        tokenize_result = self.tokenize(
            text, return_overflow=True, prompt_size=prompt_size
        )
        token_chunks = tokenize_result.input_ids
        length = tokenize_result.attention_mask.sum(axis=1).tolist()
        text_chunks = [self.decode(chunk) for chunk in token_chunks]
        return list(zip(text_chunks, length))

    def filter_chunks(self, chunks):
        # too short inputs may give errors
        chunks = [chunk for chunk in chunks if chunk[1] > 10]
        # don't summarize last chunk if too short
        if len(chunks) > 1 and chunks[-1][1] < chunks[0][1] / 10:
            chunks = chunks[:-1]
        return chunks

    def post_process(self, summaries):
        summaries = [s.replace(".<n>", ". ") for s in summaries]
        summaries = [space_re.sub(" ", s) for s in summaries]
        summaries = [s.strip() for s in summaries]
        summaries = [f"{s}." if not s.endswith(".") else s for s in summaries if s]
        return " ".join(summaries)

    def tokenize(
        self, text, *, add_special_tokens=True, return_overflow=False, prompt_size=0
    ):
        return self.tokenizer(
            text,
            add_special_tokens=add_special_tokens,
            max_length=self.max_length - prompt_size,
            padding=True,
            return_tensors="pt",
            truncation=True,
            return_overflowing_tokens=return_overflow,
            return_attention_mask=True,
        )

    def summarize_chunk(self, chunk, *, ratio, use_contrastive_search):
        text, length = chunk
        arguments = self.get_arguments(
            use_contrastive_search=use_contrastive_search,
            desired_length=length * ratio,
        )
        if isinstance(self.generator, SummarizationPipeline):
            generated = self.generator(
                text, clean_up_tokenization_spaces=True, **arguments
            )
            return generated[0]["summary_text"]
        tokenized = self.tokenize(text)
        (gen,) = self.generator.generate(**tokenized, **arguments)
        return self.decode(gen)

    def __call__(self, text, *, ratio, use_contrastive_search, prompt=None):
        if ratio > 0.5:
            ratio = 0.5
        if prompt:
            prompt = space_re.sub(" ", prompt).strip()
        if prompt:
            prompt_size = int(
                self.tokenize(prompt, add_special_tokens=False)["attention_mask"].sum()
            )
        else:
            prompt_size = 0
        if prompt_size > self.max_length / 2:
            raise ValueError(
                "the prompt is bigger then 2 * max_length, a prompt should never be this large"
            )
        chunks = self.chunk(text, prompt_size=prompt_size)
        chunks = self.filter_chunks(chunks)
        if prompt:
            chunks = [(f"{prompt} {text}", length) for text, length in chunks]
        summaries = [
            self.summarize_chunk(
                chunk, ratio=ratio, use_contrastive_search=use_contrastive_search
            )
            for chunk in chunks
        ]
        return self.post_process(summaries)
