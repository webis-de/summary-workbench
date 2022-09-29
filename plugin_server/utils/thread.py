import asyncio

import kthread

from utils.aio import to_thread, wait_first


class CancableThread(kthread.KThread):
    def run(self):
        self.result = None
        self.exc = None
        try:
            self.result = self._target(*self._args, **self._kwargs)
        except Exception as e:
            self.exc = e

    async def _run_async(self):
        self.start()
        try:
            await to_thread(self.join)
            if self.exc:
                raise self.exc
            return self.result
        except asyncio.CancelledError:
            if self.is_alive():
                self.terminate()
            raise

    async def run_until_finish_or_event(self, event):
        result, _ = await wait_first([self._run_async(), event.wait()])
        return result
