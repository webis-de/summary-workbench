from functools import partial
from itertools import chain

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .util import filter_tokens


def rank_score(sentences, scores, limit=3):
    """cosine similarity of the tfidf vectors to the
    highest ranked sentences in the tfidf matrix.
    the highest ranked sentences are combined into
    one document.
    """
    if len(sentences) <= limit:
        rank_scores = np.zeros(len(sentences))
    else:
        df = pd.DataFrame({"sentences": sentences, "scores": scores})
        df.reset_index(inplace=True)
        df.sort_values("scores", inplace=True, ascending=False)
        query = df["sentences"].iloc[:limit]
        docs = df["sentences"].iloc[limit:]
        analyzer = partial(filter_tokens, use_lemma=True)
        vectorizer = TfidfVectorizer(analyzer=analyzer, smooth_idf=True)
        query = list(chain.from_iterable(query))
        tfidf = vectorizer.fit_transform(docs)
        query_vec = vectorizer.transform([query])
        rank_scores = cosine_similarity(query_vec, tfidf).ravel()
        rank_scores = np.concatenate((np.ones(limit), rank_scores))
        rank_scores = pd.Series(rank_scores, index=df["index"])
        rank_scores = rank_scores.sort_index().values
        rank_scores = (rank_scores - rank_scores.mean()) / (
            rank_scores.std() + 0.5
        )  # + 0.5 because a lot of values are 0 and this would give a very low standard deviation, which would boost high ranks too much
    return rank_scores
