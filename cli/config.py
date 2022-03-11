from pathlib import Path

DEPLOY_PATH = Path("./deploy")
KUBERNETES_TEMPLATES_PATH = Path("./templates/kubernetes")
DOCKER_TEMPLATES_PATH = Path("./templates/docker")
PLUGIN_CONFIG_PATH = Path("./api/plugin_config.json")
DOCKER_COMPOSE_YAML_PATH = Path("./docker-compose.yaml")
DEV_IMAGE_PATH = Path("./images/dev")
DEV_IMAGES = [path.name for path in DEV_IMAGE_PATH.glob("*")]
DEPLOY_IMAGE_PATH = Path("./images/deploy")
DEPLOY_IMAGES = [path.name for path in DEPLOY_IMAGE_PATH.glob("*")]
CONTAINER_PLUGIN_FILES_PATH = "/tldr_plugin_files"
CONTAINER_PLUGIN_SERVER_PATH = "/tldr_plugin_server"
PLUGIN_SERVER_PATH = Path("./plugin_server").absolute()
REMOTE_PLUGIN_FOLDER = Path("~/.tldr_plugins").expanduser()
BASE_COMMAND = " && ".join(
    [
        "pip install -r /tldr_plugin_server/requirements.txt",
        "python model_setup.py",
        "uvicorn app:app --app-dir /tldr_plugin_server --host 0.0.0.0 --port 5000 --reload --reload-dir /tldr_plugin_files --reload-dir /tldr_plugin_server",
    ]
)
PIPENV_COMMAND = f"pipenv install && pipenv run bash -c '{BASE_COMMAND}'"
REQUIREMENTS_TXT_COMMAND = f"([[ -d /root/.venv ]] || python -m venv /root/.venv) && source /root/.venv/bin/activate && pip install -r requirements.txt && {BASE_COMMAND}"
CONFIG_PATH = {"path": "./config.yaml"}

COPY_PLUGIN_DOCKER_FILE = f"""
{{environment}}
WORKDIR {CONTAINER_PLUGIN_SERVER_PATH}"
COPY . .
RUN python model_setup.py
"""

COPY_SERVER_DOCKER_FILE = f"""
WORKDIR {CONTAINER_PLUGIN_SERVER_PATH}
COPY . .
RUN pip install flask gunicorn
ENV GUNICORN_CMD_ARGS=-cgunicorn.conf.py
CMD ["gunicorn", "wsgi:app"]
"""
