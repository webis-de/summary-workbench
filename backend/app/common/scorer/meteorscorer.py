from nlgeval import Meteor

from . import Scorer


class MeteorScorer(Scorer):
    def __init__(self):
        self.meteor = Meteor()

    def score(self, hypothesis, references):
        hyp_list_zip = [[hyp] for hyp in hypothesis]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        return self.meteor.compute_score(refs, hyps)[0]
