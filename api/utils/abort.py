from sys import stderr


def aborter(message):
    if not hasattr(aborter, "was_aborted"):
        aborter.was_aborted = True
        print(message, file=stderr)
        exit(1)
