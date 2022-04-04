import io
import json
import tarfile
from pathlib import Path

from termcolor import colored

import docker

from .exceptions import (BaseManageError, DockerNotRunningError,
                         DockerUsernameRequiredError)
from .utils import Yaml


def docker_context(dockerfile, path):
    print(f"preparing context {colored(path.absolute(), 'yellow')}")
    fh = io.BytesIO()
    with tarfile.open(fileobj=fh, mode="w:gz") as tar:
        data = dockerfile.encode("utf-8")
        if path is not None:
            tar.add(path, arcname=".")
        info = tarfile.TarInfo("Dockerfile")
        info.size = len(data)
        tar.addfile(info, io.BytesIO(data))
    fh.seek(0)
    return fh


class Docker:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except docker.errors.DockerException:
            raise DockerNotRunningError("the docker service is not running", "docker")

    def exists(self, image):
        try:
            self.client.images.get(image)
            return True
        except docker.errors.ImageNotFound:
            return False

    def build_image(self, dockerfile, context_path=None, buildargs=None):
        context = docker_context(dockerfile, context_path)
        print(colored("--- DOCKERFILE BEGIN ---", "yellow"))
        print(colored(dockerfile, "yellow"))
        print(colored("--- DOCKERFILE END   ---", "yellow"))
        for status in self.client.api.build(
            fileobj=context,
            encoding="gzip",
            custom_context=True,
            decode=True,
            rm=True,
            buildargs=buildargs,
        ):
            error = status.get("error")
            if error:
                raise BaseManageError(error, context_path)
            stream = status.get("stream")
            if stream:
                print(stream, end="")
        context.seek(0)
        image = self.client.images.build(
            fileobj=context, encoding="gzip", custom_context=True
        )[0]
        return image.id.split(":")[1]

    def build_chain(self, build_context, tag):
        colored_tag = colored(tag, "green")
        print(f"building {colored_tag}")
        previous_id = None
        for context in build_context:
            context = context.copy()
            dockerfile = context["dockerfile"]
            if previous_id is not None:
                context["dockerfile"] = f"FROM {previous_id}\n{dockerfile}"
            previous_id = self.build_image(**context)
        self.tag(previous_id, tag)
        print(f"done building {colored_tag}")

    def tag(self, image_id, tag):
        self.client.images.get(image_id).tag(tag)

    def push(self, repository, tag):
        image_name = f"{repository}:{tag}"
        colored_tag = colored(image_name, "green")
        print(f"pushing {colored_tag}")
        for line in self.client.images.push(
            repository=repository, tag=tag, stream=True
        ):
            if b"error" in line:
                status = json.loads(line)
                error = status.get("error")
                if error:
                    raise BaseManageError(
                        [
                            (error, image_name),
                            ("failed (maybe you need to 'docker login' first)", "push"),
                        ]
                    )
        print(f"done pushing {colored_tag}")


class DockerMixin:
    def __init__(self, deploy_src, deploy_dest, docker_username, name, image_url):
        # TODO: image_url
        self.__docker_username = docker_username
        self.__deploy_src = Path(deploy_src)
        self.__deploy_dest = Path(deploy_dest)
        self.__name = name
        self.__image_url = image_url

    @property
    def docker_username(self):
        if self.__docker_username is None:
            raise DockerUsernameRequiredError("docker_username is required")
        return self.__docker_username

    @property
    def repository(self):
        return f"{self.__docker_username}/{self.__name}"

    @property
    def tag(self):
        return f"{self.repository}:{self.get_version()}"

    @property
    def image_url(self):
        if self.__image_url:
            return self.__image_url
        return f"docker.io/{self.tag}"

    def build(self):
        # TODO: ignore images with image_url
        Docker().build_chain(self.build_chain_args(), self.tag)

    def push(self):
        # TODO: ignore images with image_url
        Docker().push(self.repository, self.get_version())

    def gen_kubernetes(self):
        yaml = Yaml.load(self.__deploy_src)
        try:
            yaml.extend(self.patch())
        except NotImplementedError:
            pass
        yaml.dump(self.__deploy_dest)

    def patch(self):
        raise NotImplementedError()

    def build_chain_args(self):
        raise NotImplementedError()

    def get_version(self):
        raise NotImplementedError()
