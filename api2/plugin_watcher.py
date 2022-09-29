import asyncio
import json
import warnings
from pathlib import Path

from utils.abort import aborter
from utils.aio import to_future
from utils.request import request


def filter_available(plugins):
    return [
        key
        for key, value in plugins.items()
        if not value["disabled"] and value["healthy"]
    ]


class PluginWatcher:
    def __init__(
        self,
        update_every=30,
        timeout=2,
        config_path="/plugin_config/plugin_config.json",
    ):
        self.update_every = update_every
        self.timeout = timeout
        self.config_path = Path(config_path).expanduser()

    async def gather_configs(self):
        raw_config = json.loads(self.config_path.read_text())
        gathered = {"summarizer": {}, "metric": {}}
        keys, request_data = zip(
            *[
                (key, {"url": f"{value}/config", "timeout": self.timeout})
                for key, value in raw_config.items()
                if isinstance(value, str)
            ]
        )
        responses = dict(zip(keys, await request(request_data)))
        for key, value in raw_config.items():
            config = responses.get(key)
            if config is None:
                config = value
                config["disabled"] = True
            elif isinstance(config, TimeoutError):
                config = {"disabled": False, "healthy": False, "key": key}
            else:
                config["url"] = value
                config["disabled"] = False
                config["healthy"] = True
                config_key = config["key"]
                if key != config_key:
                    warnings.warn(
                        f"plugin is configured as {key} but the container has key {config_key}"
                    )
            type_, _, name = key.split("-")[:3]
            config.setdefault("type", type_)
            config.setdefault("name", name)
            config.setdefault("metadata", {})
            gathered.setdefault(config["type"], {})
            gathered[config["type"]][config["key"]] = config
        return gathered

    async def update(self):
        config = await self.gather_configs()
        self.metrics = config["metric"]
        self.summarizers = config["summarizer"]
        self.metric_keys = filter_available(self.metrics)
        self.summarizer_keys = filter_available(self.summarizers)

    @to_future
    async def update_loop(self):
        try:
            while True:
                await asyncio.sleep(self.update_every)
                await self.update()
        except asyncio.CancelledError:
            raise
        except Exception as e:
            aborter(
                f"the watcher loop finished with exception {e}, which should never happen"
            )

    async def start(self):
        await self.update()
        self.update_loop()
