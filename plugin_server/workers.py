import asyncio

from utils.aio import to_future
from utils.cache import Cache
from utils.pipe import Pipe
from utils.thread import CancableThread


class Batcher:
    def __init__(self, batch_size):
        assert batch_size > 0, "the batch size has to be at least 1"
        self.batch_size = batch_size
        self.num_elements = 0
        self.num_staging = 0
        self.pipe = Pipe()

    def make_batches(self, l):
        l = list(l)
        for i in range(0, len(l), self.batch_size):
            yield l[i : i + self.batch_size]

    def num_waiting_requests(self):
        return len(self.pipe)

    def num_waiting_elements(self):
        return self.num_elements + self.num_staging

    def add(self, work):
        self.pipe.add(work)
        self.num_elements += work.remaining

    async def consume(self):
        async for work in self.pipe.drain():
            self.num_elements -= work.remaining
            self.num_staging = work.remaining
            arguments = work.arguments
            remaining = work.get_remaining()
            for batch in self.make_batches(remaining):
                indices, batch = zip(*batch)
                if work.is_done():
                    break
                self.num_staging -= len(batch)
                yield work, indices, {"batch": list(batch), **arguments}
            del work
            self.num_staging = 0


class Work:
    def __init__(self, event_box, data, cache):
        self.event_box = event_box
        self.arguments = data.copy()
        self.batch = self.arguments["batch"]
        del self.arguments["batch"]
        self.remaining = len(self)
        self.results = [None] * len(self)
        self.is_set = [False] * len(self)
        self.cache = cache
        self.arguments_hash = self.cache.hash(self.arguments)
        self.add_cached()
        self.check_done()

    def __del__(self):
        if not self.is_done():
            self.set_error(
                f"request was not fully processed, there are {self.remaining} elements remaining"
            )

    def __len__(self):
        return len(self.batch)

    def add_cached(self):
        for i, e in self.get_remaining():
            try:
                self.add_processed(i, self.cache.get([e, self.arguments_hash]))
            except KeyError:
                pass

    def get_remaining(self):
        return [
            e for e, is_set in zip(enumerate(self.batch), self.is_set) if not is_set
        ]

    def set_done(self, results):
        self.event_box.set_done(results)

    def set_error(self, message):
        self.event_box.set_error(message)

    def set_application_error(self, message):
        self.event_box.set_application_error(message)

    def is_done(self):
        return self.event_box.any_event_is_set()

    def check_done(self):
        if self.remaining == 0:
            self.set_done(self.results)

    def add_processed(self, i, instance):
        if self.is_set[i]:
            self.set_error(f"element {i} was already set")
        else:
            self.cache.set([self.batch[i], self.arguments_hash], instance)
            self.results[i] = instance
            self.is_set[i] = True
            self.remaining -= 1
            self.check_done()


class Workers:
    def __init__(self, func, num_threads=1, batch_size=32, cache_size=0):
        assert num_threads > 0, "the number of threads has to be at least 1"
        self.batcher = Batcher(batch_size)
        self.cache = Cache(cache_size)
        self.num_threads = num_threads
        self.func = func
        self.cache_size = cache_size
        self.curr_processing_size = 0
        self.worker_process = None
        self.threads = set()

    def startup(self):
        if self.worker_process is not None:
            raise ValueError("workers are already running")
        else:
            self.worker_process = self._start_work()

    def shutdown(self):
        if self.worker_process is None:
            raise ValueError("workers are not running")
        else:
            self.worker_process.cancel()
            self.worker_process = None

    def num_running_threads(self):
        return len([t for t in self.threads if not t.done()])

    def num_running_elements(self):
        return self.curr_processing_size

    def num_waiting_requests(self):
        return self.batcher.num_waiting_requests()

    def num_waiting_elements(self):
        return self.batcher.num_waiting_elements()

    def submit(self, event_box, data):
        work = Work(event_box, data, cache=self.cache)
        if not work.is_done():
            self.batcher.add(work)

    @to_future
    async def _process(self, work, indices, batch):
        size = len(batch["batch"])
        self.curr_processing_size += size
        try:
            thread = CancableThread(target=lambda: self.func(**batch))
            try:
                results = await thread.run_until_finish_or_event(work.event_box)
            except Exception as e:
                work.set_error(str(e))
                return
            len_returned = len(results)
            if len_returned == size:
                for i, e in zip(indices, results):
                    work.add_processed(i, e)
            else:
                work.set_error(
                    f"the supplied function returned {len_returned} results instead of {size} results"
                )
        except (asyncio.CancelledError, SystemExit, KeyboardInterrupt):
            raise
        except Exception as e:
            work.set_application_error(str(e))
        finally:
            self.curr_processing_size -= size

    @to_future
    async def _start_work(self):
        try:
            async for batch in self.batcher.consume():
                self.threads.add(self._process(*batch))
                if len(self.threads) >= self.num_threads:
                    _, self.threads = await asyncio.wait(
                        self.threads, return_when=asyncio.FIRST_COMPLETED
                    )
                del batch
        finally:
            for t in self.threads:
                t.cancel()
            self.threads = set()
