import os
import shutil
import tarfile
import requests
from pathlib import Path

CHECKPOINT_URL = "https://files.webis.de/summarization-models/gsum/checkpoints/bart_sentence.pt"
DATA_URL = "https://files.webis.de/summarization-models/gsum/data.tar.gz"
SAVE_PATH = Path("~/checkpoints").expanduser()
DATA_PATH = Path("~/data").expanduser()


def setup():
    Path(SAVE_PATH).mkdir(parents=True, exist_ok=True)
    Path(DATA_PATH).mkdir(parents=True, exist_ok=True)
    response_ckpt = requests.get(CHECKPOINT_URL, stream=True)
    response_data = requests.get(DATA_URL, stream=True)
    # download data
    print("Downloading data ...")
    data_file = tarfile.open(fileobj=response_data.raw, mode="r|gz")
    data_file.extractall(path=DATA_PATH)
    print("Downloaded and extracted data.")
    
    # # download model checkpoint
    print("Downloading checkpoint ...")
    with open(SAVE_PATH / "bart_sentence.pt","wb") as outf:
        shutil.copyfileobj(response_ckpt.raw, outf)
        print("Downloaded model checkpoint.")

if __name__ == "__main__":
    setup()