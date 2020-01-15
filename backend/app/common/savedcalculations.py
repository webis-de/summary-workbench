from collections import OrderedDict

class SavedCalculations():
    def __init__(self):
        self.saved = OrderedDict()

    def __len__(self):
        return len(self.saved)

    def get(self, id):
        return self.saved.get(id)

    def append(self, name, tables, hyps, refs):
        item = [name, tables, hyps, refs]
        self.saved[id(item)] = item

    def items(self):
        return reversed(self.saved.items())
