import os
import tarfile
import requests
from pathlib import Path
import nltk

CHECKPOINT_URL = "https://files.webis.de/summarization-models/pmisum/checkpoints.tar.gz"
SAVE_PATH = Path("~/checkpoints").expanduser()

def setup():
    Path(SAVE_PATH).mkdir(parents=True, exist_ok=True)
    response_ckpt = requests.get(CHECKPOINT_URL, stream=True)
    print("Downloading checkpoints...")
    ckpt_file = tarfile.open(fileobj=response_ckpt.raw, mode="r|gz")
    ckpt_file.extractall(path=SAVE_PATH)
    print("Downloaded and extracted checkpoint files.")
    print("Initializing NLTK ...")
    nltk.download("punkt")
    print("Initialized NLTK")

if __name__ == "__main__":
    setup()