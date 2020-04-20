from collections import OrderedDict


class Calculation():
    def __init__(self, scores, comparisons):
        self.scores = scores
        self.comparisons = comparisons


class SavedCalculations(OrderedDict):
    def __setitem__(self, name, calculation):
        if not isinstance(calculation, Calculation):
            raise ValueError(f"wrong datatype {type(calculation)} for calculation")
        oldname = name
        i = 1

        while name in self:
            name = oldname + "-" + str(i)
            i += 1

        super().__setitem__(name, calculation)

    def __iter__(self):
        yield from reversed(list(map(lambda x: (x[0], x[1].scores), self.items())))
