from newspaper import nlp


def take_ratio(ranked_sents, ratio):
    ranked_sents = [(i, s.split()) for i, s in ranked_sents]
    num_tokens = sum(len(s) for _, s in ranked_sents)
    requested_tokens = round(ratio * num_tokens)
    token_count = 0
    taken_sents = []
    for i, sent in ranked_sents:
        prev_token_count = token_count
        token_count += len(sent)
        if taken_sents and (token_count - requested_tokens) > (
            requested_tokens - prev_token_count
        ):
            break
        taken_sents.append((i, sent))
    taken_sents.sort(key=lambda x: x[0])
    return [" ".join(s) for _, s in taken_sents]


class SummarizerPlugin:
    def __init__(self):
        pass

    def summarize(self, text, ratio):
        sentences = nlp.split_sentences(text)
        keys = nlp.keywords(text)

        ranks = list(nlp.score(sentences, [], keys).items())
        ranks.sort(key=lambda x: x[1], reverse=True)
        ranks = [s[0] for s in ranks]
        summary = " ".join(take_ratio(ranks, ratio))
        return summary
