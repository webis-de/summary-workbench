from pathlib import Path

import git
import giturlparse
from termcolor import colored

from .config import REMOTE_PLUGIN_FOLDER
from .exceptions import InvalidGitLinkError


def is_github_link(source):
    return giturlparse.validate(source)


def from_github(source):
    p = giturlparse.parse(source)
    plugin_name = f"{p.platform}---{p.owner}---{p.repo}---{p.branch}"
    plugin_path = REMOTE_PLUGIN_FOLDER / plugin_name
    if not plugin_path.exists():
        print(f"cloning {colored(source, 'green')} to {colored(plugin_path, 'green')}")
        print("if a login prompt shows up, the url might be wrong")
        plugin_path.parent.mkdir(exist_ok=True, parents=True)
        git.Repo.clone_from(source, plugin_path)
    return plugin_path, p.owner

def pull(path):
    print(f"pulling {colored(path, 'green')}")
    git.Repo(path).remotes[0].pull()

def resolve_source(source):
    if isinstance(source, Path):
        return source.absolute(), None
    if not is_github_link(source):
        raise InvalidGitLinkError("the link is invalid", source)
    return from_github(source)
