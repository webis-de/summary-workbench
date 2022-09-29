import asyncio
from contextlib import asynccontextmanager
from functools import wraps


class EventWithResult(asyncio.Event):
    def __init__(self):
        super().__init__()
        self.result = None

    def set(self, result):
        self.result = result
        super().set()


async def wait_first(coros):
    futures = [asyncio.ensure_future(c) for c in coros]
    try:
        done, _ = await asyncio.wait(futures, return_when=asyncio.FIRST_COMPLETED)
        done_future = done.pop()
        done_coro = coros[futures.index(done_future)]
        return done_future.result(), done_coro
    finally:
        for future in futures:
            future.cancel()
        await asyncio.wait(futures)


def to_future(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return asyncio.ensure_future(func(*args, **kwargs))

    return wrapper


async def to_thread(func, *args, **kwargs):
    return await asyncio.get_running_loop().run_in_executor(None, func, *args, **kwargs)


@asynccontextmanager
async def parallel(coro):
    future = asyncio.ensure_future(coro)
    try:
        yield
    finally:
        future.cancel()
        await asyncio.wait([future])
