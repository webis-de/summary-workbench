#!/usr/bin/env python

import sys
from pathlib import Path

from ruamel.yaml import YAML

yaml = YAML()
compose_data = yaml.load(Path("./full-docker-compose.yaml"))
config_data = yaml.load(Path("./dev-config.yaml"))
all_services = set(compose_data["services"].keys())
basic_services = set(("api", "frontend", "mongo"))
chosen_services = basic_services.copy()
chosen_services.update(config_data["enabled-services"])
unknown_services = chosen_services - all_services

if unknown_services:
    raise ValueError(
        f"unknown services {unknown_services}; there are following services available: {all_services - basic_services}"
    )
    sys.exit(1)

compose_data["services"] = {
    service: value for service, value in compose_data["services"].items() if service in chosen_services
}
yaml.indent(mapping=2, offset=2)
yaml.dump(compose_data, Path("./docker-compose.yaml"))
