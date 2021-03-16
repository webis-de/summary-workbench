from newspaper import nlp

class Newspaper3kSummarizer:
    def __init__(self):
        pass

    def summarize(self, text, ratio):
        num_sent = len(nlp.split_sentences(text))
        return " ".join(
            nlp.summarize(
                title=" ", text=text, max_sents=max(round(num_sent * ratio * 0.1), 1)
            )
        )
