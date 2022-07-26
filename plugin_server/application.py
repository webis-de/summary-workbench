import asyncio
import logging

from errors import general_exception, validation_exception
from fastapi import FastAPI, Request, Response, WebSocket
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from manager.request import RequestManager
from manager.websocket import WebsocketManager
from workers import Workers

uvicorn_logger = logging.getLogger("uvicorn")


def build_application(func, validator, num_threads=1, batch_size=32, cache_size=0):
    app = FastAPI()
    workers = Workers(
        func, num_threads=num_threads, batch_size=batch_size, cache_size=cache_size
    )

    @app.on_event("startup")
    def startup():
        uvicorn_logger.info(f"THREADS: {num_threads}")
        uvicorn_logger.info(f"BATCH_SIZE: {batch_size}")
        uvicorn_logger.info(f"CACHE_SIZE: {cache_size}")

    @app.on_event("startup")
    def startup():
        workers.startup()

    @app.on_event("shutdown")
    def shutdown():
        workers.shutdown()

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_, exc):
        error = validation_exception(exc)
        for entry in error["errors"]:
            entry["loc"] = entry["loc"][1:]
        return JSONResponse(error, status_code=422)

    @app.exception_handler(Exception)
    async def general_exception_handler(_, exc):
        return JSONResponse(general_exception(exc), status_code=500)

    @app.post("/validate")
    def validate(_: validator):
        pass

    @app.post("/")
    async def index(body: validator, request: Request, response: Response):
        request_manager = RequestManager(request)
        return await request_manager.send_to_workers(body.dict(), workers, response)

    @app.websocket("/websocket")
    async def websocket(websocket: WebSocket):
        websocket_manager = WebsocketManager(websocket, validator)
        await websocket_manager.loop_until_disconnect(workers)

    async def statistics():
        return {
            "batch size": workers.batcher.batch_size,
            "items in cache": workers.cache.cache.currsize,
            "cache size": workers.cache.cache.maxsize,
            "maximal threads": workers.num_threads,
            "running threads": workers.num_running_threads(),
            "running elements": workers.num_running_elements(),
            "waiting requests": workers.num_waiting_requests(),
            "waiting elements": workers.num_waiting_elements(),
            "futures in event loop": len(asyncio.all_tasks(asyncio.get_running_loop())),
        }

    app.add_api_route("/statistics", statistics, methods=["GET"])
    app.statistics = statistics

    @app.get("/health")
    async def health():
        return Response()

    return app
