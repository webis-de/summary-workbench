import asyncio

from fastapi import WebSocketDisconnect
from pydantic import ValidationError
from starlette.websockets import WebSocketState
from utils.aio import parallel, to_future
from utils.event import EventBox
from utils.pipe import SortedPipe

from errors import general_exception, validation_exception

class WebsocketManager:
    def __init__(self, websocket, validator):
        self.websocket = websocket
        self.validator = validator
        self.pipe = SortedPipe()
        self.disconnect_event = asyncio.Event()

    def is_disconnected(self):
        return self.websocket.client_state == WebSocketState.DISCONNECTED

    async def send(self, data):
        await self.websocket.send_json(data)

    @to_future
    async def _send_to_workers(self, index, data, workers):
        event_box = EventBox(self.disconnect_event)
        workers.submit(event_box, data)
        await event_box.wait()
        self.pipe.add(index, event_box.make_response())

    async def _handle_responses(self):
        async for result in self.pipe.drain():
            await self.send(result)

    async def _handle_requests(self, workers):
        while True:
            body = await self.websocket.receive_json()
            index = self.pipe.next_index()
            try:
                body = self.validator(**body)
                self._send_to_workers(index, body.dict(), workers)
            except (asyncio.CancelledError, SystemExit, KeyboardInterrupt):
                raise
            except ValidationError as e:
                self.pipe.add(index, validation_exception(e))
            except Exception as e:
                self.pipe.add(index, general_exception(e))

    async def loop_until_disconnect(self, workers):
        await self.websocket.accept()
        try:
            async with parallel(self._handle_responses()):
                await self._handle_requests(workers)
        except WebSocketDisconnect:
            pass
        finally:
            self.disconnect_event.set()
