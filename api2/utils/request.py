import asyncio

import aiohttp
from utils.aio import wait_first


async def _fetch(session, parse_as_json=True, **kwargs):
    async with session.request(**kwargs) as response:
        response.raise_for_status()
        if parse_as_json:
            return await response.json()
        return await response.text()


async def request(request_data, cancel_event=None, return_exceptions=True):
    async with aiohttp.ClientSession() as session:
        requests = []
        for data in request_data:
            data = data.copy()
            method = data.get("method")
            if method is None:
                data["method"] = "GET" if data.get("json") is None else "POST"
            requests.append(_fetch(session, **data))
        gather_coro = asyncio.gather(*requests, return_exceptions=return_exceptions)
        coros = [gather_coro]
        if cancel_event is not None:
            coros.append(cancel_event.wait())
        result, coro = await wait_first(coros)
        if coro is gather_coro:
            return result
        raise asyncio.CancelledError()
