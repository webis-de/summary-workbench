from nlgeval import Cider

from . import Scorer


class CiderScorer(Scorer):
    def __init__(self):
        self.cider = Cider()

    def score(self, hypothesis, references):
        hyp_list_zip = [[hyp] for hyp in hypothesis]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        return self.cider.compute_score(refs, hyps)[0]
