import os
import tarfile
from pathlib import Path

import nltk
import requests

CHECKPOINT_URL = "https://files.webis.de/summarization-models/pmisum/checkpoints.tar.gz"
SAVE_PATH = Path("~/checkpoints").expanduser()


def is_within_directory(directory, target):
    abs_directory = os.path.abspath(directory)
    abs_target = os.path.abspath(target)
    prefix = os.path.commonprefix([abs_directory, abs_target])
    return prefix == abs_directory


def safe_extract(tar, path=".", members=None, *, numeric_owner=False):
    for member in tar.getmembers():
        member_path = os.path.join(path, member.name)
        if not is_within_directory(path, member_path):
            raise Exception("Attempted Path Traversal in Tar File")
    tar.extractall(path, members, numeric_owner=numeric_owner)


def setup():
    Path(SAVE_PATH).mkdir(parents=True, exist_ok=True)
    response_ckpt = requests.get(CHECKPOINT_URL, stream=True)
    print("Downloading checkpoints...")
    with tarfile.open(fileobj=response_ckpt.raw, mode="r|gz") as ckpt_file:
        safe_extract(ckpt_file, path=SAVE_PATH)
    print("Downloaded and extracted checkpoint files.")
    print("Initializing NLTK ...")
    nltk.download("punkt")
    print("Initialized NLTK")


if __name__ == "__main__":
    setup()
