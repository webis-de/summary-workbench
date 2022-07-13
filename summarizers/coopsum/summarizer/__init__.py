import os

import torch
from coop.coop import VAE, util
from nltk.tokenize import sent_tokenize

MODEL = os.environ["model"]


class CoopModel(object):
    MODELS = {
        "COOP-Amazon": "megagonlabs/bimeanvae-amzn",
        "COOP-Yelp": "megagonlabs/bimeanvae-yelp",
    }

    def __init__(self, model="COOP-Amazon"):
        self.model = self.MODELS[model]
        self.metadata = {"model": self.model}
        self.vae = VAE(self.model, device="cpu")
        if self.vae:
            print("Intialized successfully.")

    def summarize(self, text, ratio=0.2):
        sentences = sent_tokenize(text)
        raw_encodings = self.vae.encode(sentences)
        size = len(raw_encodings)
        if size > 10:
            raise ValueError(
                f"The number of sentences is {size}. To keep the memory footprint small (due to the powerset construction), use a document with not more than 10 sentences."
            )
        encoding_idxes = util.powerset(size)
        vectors = [raw_encodings[idx].mean(dim=0) for idx in encoding_idxes]
        stacked_encodings = torch.stack(vectors).to(torch.device("cpu"))
        outputs = self.vae.generate(stacked_encodings)
        best_output = max(
            outputs, key=lambda x: util.input_output_overlap(inputs=sentences, output=x)
        )
        return best_output


class SummarizerPlugin:
    def __init__(self) -> None:
        print("Initializing Coop Model")
        self.summarizer = CoopModel()

    def summarize(self, *args, **kwargs):
        return self.summarizer.summarize(*args, **kwargs)

    def metadata(self):
        return self.summarizer.metadata
