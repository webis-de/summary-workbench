import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from functools import partial
from itertools import chain
from summarizer.util import filter_tokens

def rank_score(sentences, scores, limit=3, use_exp=True):
    """cosine similarity of the tfidf vectors to the
    highest ranked sentences in the tfidf matrix.
    the highest ranked sentences are combined into
    one document.
    """
    if len(sentences) <= limit:
        rank_scores = np.ones(len(sentences))
    else:
        df = pd.DataFrame({"sentences": sentences, "scores": scores})
        df.reset_index(inplace=True)
        df.sort_values("scores", inplace=True, ascending=False)
        query = df["sentences"][:limit]
        docs = df["sentences"][limit:]
        analyzer = partial(filter_tokens, use_lemma=True)
        vectorizer = TfidfVectorizer(analyzer=analyzer, smooth_idf=True)
        query = list(chain.from_iterable(query))
        tfidf = vectorizer.fit_transform(docs)
        query_vec = vectorizer.transform([query])
        rank_scores = cosine_similarity(query_vec, tfidf).ravel()
        rank_scores = np.concatenate((np.ones(limit), rank_scores))
        rank_scores = pd.Series(rank_scores, index=df["index"])
        rank_scores = rank_scores.sort_index().values
    if use_exp:
        rank_scores = np.exp(rank_scores)
    return rank_scores
