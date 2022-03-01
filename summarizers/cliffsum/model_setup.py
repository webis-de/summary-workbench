import requests
from pathlib import Path
from tqdm.auto import tqdm
import tarfile
import os


SAVE_DIR = Path("~/checkpoints").expanduser()
MASKREL_URL = "https://files.webis.de/summarization-models/cliffsum/checkpoints/maskrel.tar.gz"
MASKENT_URL = "https://files.webis.de/summarization-models/cliffsum/checkpoints/maskent.tar.gz"
REGENENT_URL = "https://files.webis.de/summarization-models/cliffsum/checkpoints/regenent.tar.gz"
REGENREL_URL = "https://files.webis.de/summarization-models/cliffsum/checkpoints/regenrel.tar.gz"
SWAPENT_URL = "https://files.webis.de/summarization-models/cliffsum/checkpoints/swapent.tar.gz"
SYSLOWCON_URL = "https://files.webis.de/summarization-models/cliffsum/checkpoints/syslowcon.tar.gz"
CHECKPOINT_URLS = [MASKREL_URL, MASKENT_URL, REGENENT_URL, REGENREL_URL, SWAPENT_URL, SYSLOWCON_URL]

def _extract_file_and_delete(filepath):
    gz_file = tarfile.open(filepath, mode="r:gz")
    if type(gz_file) is tarfile.TarFile:
        print("Extracting checkpoints...")
        members = gz_file.getmembers()
        for member in tqdm(members):
            gz_file.extract(member, SAVE_DIR)
        print("Extracted checkpoints {}".format(list(Path(SAVE_DIR).iterdir())))
        os.remove(filepath)
        print("Deleted compressed file.")
       
def setup():
    Path(SAVE_DIR).mkdir(parents=True, exist_ok=True)
    for url in CHECKPOINT_URLS:
        model_name = url.split("/")[-1].replace(".tar.gz","")
        save_path = SAVE_DIR / url.split("/")[-1]
        response = requests.get(url, stream=True)
        print("Downloading {} checkpoints".format(model_name))
        with open(save_path, "wb") as outf:
            outf.write(response.content)
        print("Downloaded {} checkpoints.".format(model_name))
        if os.path.exists(save_path):
            _extract_file_and_delete(save_path)

if __name__ =="__main__":
    setup()
