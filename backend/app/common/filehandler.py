from collections import OrderedDict


class FileHandler(OrderedDict):
    def __setitem__(self, key, value):
        super(FileHandler, self).__setitem__(key, value)
        self.move_to_end(key)

    def choices(self):
        return list(reversed(self.keys()))
