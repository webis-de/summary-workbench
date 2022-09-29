import asyncio

from utils.aio import wait_first


class EventBox:
    def __init__(self, disconnect_event):
        self.result_event = asyncio.Event()
        self.disconnect_event = disconnect_event
        self.result = None
        self.result_type = None

    def _set_result(self, result, result_type):
        self.result = result
        self.result_type = result_type
        self.result_event.set()

    def set_done(self, result):
        self._set_result(result, "done")

    def set_error(self, error):
        self._set_result(error, "error")

    def set_application_error(self, error):
        self._set_result(error, "application_error")

    def events(self):
        return self.result_event, self.disconnect_event

    def any_event_is_set(self):
        return any(e.is_set() for e in self.events())

    async def wait(self):
        await wait_first([e.wait() for e in self.events()])

    def make_response(self, response=None):
        if self.result_type == "done":
            return {"success": True, "results": self.result}
        elif self.result_type == "error":
            if response is not None:
                response.status_code = 400
            return {"success": False, "error": "USER", "message": self.result}
        elif self.result_type == "application_error":
            if response is not None:
                response.status_code = 500
            return {"success": False, "error": "APPLICATION", "message": self.result}
        elif self.disconnect_event.is_set():
            if response is not None:
                response.status_code = 204
            return {"success": False, "error": "DISCONNECTED", "message": "connection lost"}
        if response is not None:
            response.status_code = 500
        return {"success": False, "error": "APPLICATION", "message": "request was not done and had no errors"}
