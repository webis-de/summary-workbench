from sys import stderr


class Aborter:
    def __init__(self):
        self.was_aborted = False

    def __call__(self, message):
        if not self.was_aborted:
            self.was_aborted = True
            print(message, file=stderr)
            exit(1)


aborter = Aborter()
