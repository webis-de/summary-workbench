from nlgeval import Bleu

from . import Scorer


class BleuScorer(Scorer):
    def __init__(self):
        self.bleu = Bleu(4)

    def score(self, hypothesis, references):
        hyp_list_zip = [[hyp] for hyp in hypothesis]
        ref_list_zip = [[ref] for ref in references]

        hyps = dict(enumerate(hyp_list_zip))
        refs = dict(enumerate(ref_list_zip))

        score = self.bleu.compute_score(refs, hyps)[0]
        return dict(zip(["Bleu_1", "Bleu_2", "Bleu_3", "Bleu_4"], score))
