from .meteor import Meteor

__author__ = "tylin"


class METEORScorer:
    def __init__(self):
        self.meteor = Meteor()

    def score(self, hypotheses, references):
        hyp_list_zip = [[hyp] for hyp in hypotheses]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        return {"meteor": self.meteor.compute_score(refs, hyps)[0]}
