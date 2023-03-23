import os

from .scores import Scorer


class SummarizerPlugin:
    def __init__(self, model=None):
        self.model_name = model or os.environ.get("model") or "en_core_web_lg"
        self.model = Scorer(self.model_name)

    def summarize(
        self,
        batch,
        ratio,
        title: str = "",
        use_tfidf: bool = True,
        use_special_tokens: bool = True,
        use_position: bool = True,
        use_average_lexical_connectivity: bool = True,
        use_content_words_ratio: bool = True,
        use_length: bool = True,
        use_rank: bool = True,
    ):
        return [
            self.model.summarize(
                text,
                ratio,
                title=title,
                use_tfidf=use_tfidf,
                use_special_tokens=use_special_tokens,
                use_position=use_position,
                use_average_lexical_connectivity=use_average_lexical_connectivity,
                use_content_words_ratio=use_content_words_ratio,
                use_length=use_length,
                use_rank=use_rank,
            )
            for text in batch
        ]

    def metadata(self):
        return {"model": self.model_name}
