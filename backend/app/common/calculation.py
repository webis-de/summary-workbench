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
        oldname = name
        i = 1
        while True:
            try:
                self.saved[name] = calculation
                break
            except:
                name = oldname + "-" + str(i)
                i += 1

    def __getitem__(self, name):
        return self.saved[name]

    def get(self, id):
        return self.saved.get(id)

    def __iter__(self):
        yield from reversed(self.saved)
