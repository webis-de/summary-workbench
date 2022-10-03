from .meteor import Meteor

__author__ = "tylin"


class MetricPlugin:
    def __init__(self):
        self.meteor = Meteor()

    def _evaluate(self, hypotheses, references):
        hyp_list_zip = [[hyp] for hyp in hypotheses]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        _, scores = self.meteor.compute_score(refs, hyps)
        return scores

    def evaluate(self, batch, references):
        return [self._evaluate(hypotheses, references) for hypotheses in batch]
