from collections import OrderedDict


class Calculation():
    def __init__(self, hyps, refs, scores):
        self.scores = scores
        self.hyps = hyps
        self.refs = refs


class SavedCalculations():
    def __init__(self):
        self.saved = OrderedDict()

    def __setitem__(self, name, calculation):
        assert isinstance(calculation, Calculation)
        oldname = name
        i = 1

        while name in self.saved:
            name = oldname + "-" + str(i)
            i += 1

        self.saved[name] = calculation

    def __getitem__(self, name):
        return self.saved[name]

    def get(self, id):
        return self.saved.get(id)

    def __iter__(self):
        yield from reversed(list(map(lambda x: (x[0], x[1].scores), self.saved.items())))
