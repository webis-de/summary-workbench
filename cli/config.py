from pathlib import Path

KUBERNETES_PATH = Path("./deploy")
DEV_IMAGE_PATH = Path("./images/dev")
DEV_IMAGES = [path.name for path in DEV_IMAGE_PATH.glob("*")]
DEPLOY_IMAGE_PATH = Path("./images/deploy")
DEPLOY_IMAGES = [path.name for path in DEPLOY_IMAGE_PATH.glob("*")]
CONTAINER_PLUGIN_FILES_PATH = "/tldr_plugin_files"
CONTAINER_PLUGIN_SERVER_PATH = "/tldr_plugin_server"
PLUGIN_SERVER_PATH = Path("./plugin_server").absolute()
PLUGIN_FOLDER = Path("~/.tldr_plugins").expanduser()
BASE_COMMAND = " && ".join(
    [
        "pip install flask",
        "python model_setup.py",
        "cd /tldr_plugin_server",
        "python wsgi.py",
    ]
)
CONFIG_PATH = {"path": "./config.yaml"}
