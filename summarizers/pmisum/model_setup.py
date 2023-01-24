import tarfile
from pathlib import Path

import nltk
import requests

CHECKPOINT_URL = "https://files.webis.de/summarization-models/pmisum/checkpoints.tar.gz"
SAVE_PATH = Path("~/.cache/pmisum").expanduser()


def setup():
    if not SAVE_PATH.exists():
        print("Downloading checkpoints...")
        Path(SAVE_PATH).mkdir(parents=True, exist_ok=True)
        try:
            with requests.get(CHECKPOINT_URL, stream=True) as response:
                with tarfile.open(fileobj=response.raw, mode="r|gz") as tar:
                    tar.extractall(path=SAVE_PATH)
            print("Downloaded and extracted checkpoint files.")
        except Exception as e:
            print("An error occurred, removing path")
            SAVE_PATH.unlink()
            raise e
    else:
        print("Checkpoints already exist")
    print("Initializing NLTK ...")
    nltk.download("punkt")
    print("Initialized NLTK")


if __name__ == "__main__":
    setup()
