import time

class FileHandler():
    def __init__(self):
        self.files = {}

    def __getitem__(self, key):
        return self.files[key][1]

    def __setitem__(self, key, value):
        self.files[key] = (time.time(), value)

    def __delitem__(self, key):
        del self.files[key]

    def choices(self):
        return [(key,key) for key, _ in sorted(self.files.items(), key=lambda x: x[1][0], reverse=True)]

    def clear(self):
        self.files.clear()
