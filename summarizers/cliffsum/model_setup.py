import logging
import os
import tarfile
from pathlib import Path

import requests

MODEL = os.environ["model"]
SAVE_DIR = Path("~/checkpoints").expanduser()

MODELS = {
    "MaskEnt": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/maskent.tar.gz",
        "path": SAVE_DIR / "maskent",
    },
    "MaskRel": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/maskrel.tar.gz",
        "path": SAVE_DIR / "maskrel",
    },
    "RegenEnt": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/regenent.tar.gz",
        "path": SAVE_DIR / "regenent",
    },
    "RegenRel": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/regenrel.tar.gz",
        "path": SAVE_DIR / "regenrel",
    },
    "SwapEnt": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/swapent.tar.gz",
        "path": SAVE_DIR / "swapent",
    },
    "SysLowCon": {
        "url": "https://files.webis.de/summarization-models/cliffsum/checkpoints/syslowcon.tar.gz",
        "path": SAVE_DIR / "syslowcon",
    },
}


def setup():
    SAVE_DIR.mkdir(parents=True, exist_ok=True)
    url = MODELS[MODEL]["url"]
    logging.info("Downloading %s checkpoints", MODEL)
    response = requests.get(url, stream=True)
    with tarfile.open(fileobj=response.raw, mode="r|gz") as file:
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
            
        
        safe_extract(file, path=SAVE_DIR)
    logging.info("Done")


if __name__ == "__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, level=logging.INFO, style="{")
    setup()
