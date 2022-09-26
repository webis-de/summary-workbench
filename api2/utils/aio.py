import asyncio
from functools import wraps


async def wait_first(coros):
    futures = [asyncio.ensure_future(c) for c in coros]
    done, pending = await asyncio.wait(futures, return_when=asyncio.FIRST_COMPLETED)
    for future in pending:
        future.cancel()
    done_future = done.pop()
    done_coro = coros[futures.index(done_future)]
    return done_future.result(), done_coro


async def until_true(func, interval=1):
    while not await func():
        await asyncio.sleep(interval)


async def finish_or_condition(wrapped_coro, condition_func, interval=1):
    result, coro = await wait_first(
        [wrapped_coro, until_true(condition_func, interval=interval)]
    )
    if coro is wrapped_coro:
        return result
    return None


def to_future(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return asyncio.ensure_future(func(*args, **kwargs))

    return wrapper


def to_threaded(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await asyncio.to_thread(func, *args, **kwargs)

    return wrapper
