import requests
import pathlib
import inspect
import logging
from tqdm.auto import tqdm

logging.basicConfig(level = logging.INFO)

# checkpoints for LoBART_ORC models
URL_PODCAST_MODEL = "https://files.webis.de/summarization-models/longsum/podcasts/podcast_LoBART4k_ORC.pt"
CHECKPOINT_NAME = URL_PODCAST_MODEL.split("/")[-1]
SAVE_PATH = pathlib.Path("~/checkpoints").expanduser()
MODEL_PATH = SAVE_PATH / CHECKPOINT_NAME
MODEL_NAME = "LoBART"


def setup():
    logger = logging.getLogger(inspect.currentframe().f_code.co_name)
    # create checkpoints directory if non-existent
    logger.info("Creating and downloading checkpoints")
    SAVE_PATH.mkdir(parents=True, exist_ok=True)
    response = requests.get(URL_PODCAST_MODEL, stream=True)
    with tqdm.wrapattr(open(MODEL_PATH,'wb'), "write", miniters=1, total=int(response.headers.get('content-length', 0)), desc=CHECKPOINT_NAME)  as outf:
        for chunk in response.iter_content(chunk_size=4096):
            outf.write(chunk)
    logger.info("Downloaded %s", MODEL_NAME)
    logger.info("Done")

if __name__ =="__main__":
    FORMAT = "{asctime} {levelname} [{name}] {message}"
    DATEFMT = "%H:%M:%S"
    logging.basicConfig(format=FORMAT, datefmt=DATEFMT, style="{")
    setup()
