import numpy as np


def tokenize(document, nlp):
    return [sent for sent in nlp(document).sents if sent.text.strip() != ""]


def filter_tokens(tokens, remove_stopwords=True, use_lemma=False):
    return [
        token.lemma_.lower() if use_lemma else token.text
        for token in tokens
        if (not remove_stopwords or not token.is_stop)
        and not token.is_punct
        and not token.is_space
    ]


def normalize(arr):
    arr = np.array(arr)
    return (arr - np.mean(arr)) / np.std(arr)
