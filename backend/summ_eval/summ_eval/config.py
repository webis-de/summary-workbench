import os
from pathlib import Path

CACHE_PATH = Path(os.environ.get("SUMMEVAL_CACHE", "~/.cache")).expanduser() / "summeval"
PROJECT_PATH = Path(__file__).parent.absolute()
STATIC_PATH = PROJECT_PATH / "static"

os.environ["ROUGE_HOME"] = str(STATIC_PATH / "ROUGE-1.5.5")
os.environ["CORENLP_HOME"] = str(CACHE_PATH / "stanford-corenlp-full-2018-10-05")
