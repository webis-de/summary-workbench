from functools import wraps

from fastapi import Response
from utils.aio import finish_or_condition


def disconnect_checker(request):
    async def checker():
        return await request.is_disconnected()

    return checker


def cancel_on_disconnect(func):
    @wraps(func)
    async def wrapper(request, *args, **kwargs):
        result = await finish_or_condition(
            func(request, *args, **kwargs), disconnect_checker(request)
        )
        if result is None:
            return Response(status_code=204)
        return result

    return wrapper
