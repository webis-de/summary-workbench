from urllib import response
import requests
from pathlib import Path
import os
import nltk

DATA_URL = "https://files.webis.de/summarization-models/arg-pagerank/data/claim_lexicon.txt"
SAVE_DIR = Path("~/data").expanduser()

def setup():
    Path(SAVE_DIR).mkdir(parents=True, exist_ok=True)
    response = requests.get(DATA_URL, stream=False)
    with open(SAVE_DIR / "claim_lexicon.txt", 'wb') as outf:
        outf.write(response.content)
    print("Downloaded claim lexicon file")
    nltk.download('punkt')

if __name__ == "__main__":
    setup()
