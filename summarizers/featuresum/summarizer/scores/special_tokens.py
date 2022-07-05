import numpy as np

ARTICLES = {"a", "an"}
SPECIAL_POS_TAGS = {"NOUN", "ADJ", "PROPN"}


def has_special_feature(token):
    return (
        token.is_currency
        or token.is_digit
        or (token.text in ARTICLES and token.pos_ == "DET")
        or token.pos_ in SPECIAL_POS_TAGS
        or token.ent_type_ != ""
        # or token.ent_type_ == "DATE"
    )


def special_token_score(sentences):
    features = []
    for sentence in sentences:
        score = 0
        for token in sentence:
            if has_special_feature(token):
                score += 1
        features.append(score)
    return np.array(features)
