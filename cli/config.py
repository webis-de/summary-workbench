from pathlib import Path

DEPLOY_PATH = Path("./deploy")
KUBERNETES_TEMPLATES_PATH = Path("./templates/kubernetes")
DOCKER_TEMPLATES_PATH = Path("./templates/docker")
PLUGIN_CONFIG_PATH = Path("./plugin_config/plugin_config.json")
DOCKER_COMPOSE_YAML_PATH = Path("./docker-compose.yaml")
PLUGIN_DOCKERFILE_PATH = Path("./docker/Dockerfile.plugin")
CONTAINER_PLUGIN_FILES_PATH = Path("/tldr_plugin_files")
CONTAINER_PLUGIN_SERVER_PATH = Path("/tldr_plugin_server")
DEV_BOOT_PATH = CONTAINER_PLUGIN_SERVER_PATH / "dev.boot.sh"
PLUGIN_SERVER_PATH = Path("./plugin_server").absolute()
REMOTE_PLUGIN_FOLDER = Path("~/.tldr_plugins").expanduser()
REQUIRED_FILE_GROUPS = [{"Pipfile.lock", "Pipfile", "requirements.txt"}]
SCHEMA_FOLDER = Path("./schema")
DEFAULT_CONFIG = "sw-config.yaml"
DEFAULT_PLUGIN_CONFIG =  "sw-plugin-config.yaml"
DEFAULTS = {}

SETUP_PLUGIN_FILES_DOCKER_FILE = f"""
{{environment}}
WORKDIR {CONTAINER_PLUGIN_FILES_PATH}
COPY . .
RUN if [ -f Pipfile.lock -o -f Pipfile ]; then pip install pipenv && pipenv install --system; else pip install -r requirements.txt; fi
RUN python model_setup.py
"""

SETUP_SERVER_FILES_DOCKER_FILE = f"""
WORKDIR {CONTAINER_PLUGIN_SERVER_PATH}
COPY . .
RUN pip install -r requirements.txt
WORKDIR {CONTAINER_PLUGIN_FILES_PATH}
CMD ["python", "{CONTAINER_PLUGIN_SERVER_PATH}/app.py"]
"""
