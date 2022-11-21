from .util import normalize

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
    """number of special tokens (currency, digit, noun, adjective, proper noun, 'a'/'an', has an entity type) devided by length of sentence"""
    features = []
    for sentence in sentences:
        special_tokens = [token for token in sentence if has_special_feature(token)]
        score = len(special_tokens) / len(sentence)
        features.append(score)
    return normalize(features)
