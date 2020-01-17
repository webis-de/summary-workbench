from collections import OrderedDict


class Calculation():
    def __init__(self, scores, hyps, refs):
        self.scores = scores
        self.hyps = hyps
        self.refs = refs


class SavedCalculations():
    def __init__(self):
        self.saved = OrderedDict()

    def __len__(self):
        return len(self.saved)

    def get_hyps_refs(self, id):
        return self.saved.get(id)

    def append(self, name, Calculation):
        self.saved[name] = Calculation

    def items(self):
        return reversed(self.saved.items())
