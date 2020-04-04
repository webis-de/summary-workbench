from sentencesimilarity.models import USECalculator, ELMoCalculator, BERTCalculator


class EmbedMetrics():
    def __init__(self):
        self.models = {
            'use': USECalculator,
            'elmo': ELMoCalculator,
            'bert': BERTCalculator,
        }

    def compute(self, model, method, sentences):
        if model not in self.models:
            return

        model = self.models[model](method, sentences)

        model.calculate()
