import asyncio

import kthread
from fastapi import Request


class CancelError(Exception):
    pass


class CancableThread(kthread.KThread):
    def run(self):
        self.result = None
        self.exc = None
        try:
            self.result = self._target(*self._args, **self._kwargs)
        except Exception as e:
            self.exc = e

    def join(self, *args, **kwargs):
        super().join(*args, **kwargs)

    def cancel(self):
        self.terminate()

    async def run_until_finish_or_disconnect(self, request):
        self.start()
        while self.is_alive():
            await asyncio.get_running_loop().run_in_executor(
                None, self.join, 1
            )  # run thread for one second
            if await request.is_disconnected():  # terminate when disconnect
                self.cancel()
                raise CancelError()
        if self.exc:  # raise excpetion when thread exited with exception
            raise self.exc
        return self.result
