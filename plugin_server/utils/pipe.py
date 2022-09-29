import asyncio
from collections import deque
from queue import Empty, PriorityQueue


class Pipe:
    def __init__(self):
        self.deque = deque()
        self.has_next = asyncio.Event()

    def __len__(self):
        return len(self.deque)

    def add(self, element):
        self.deque.append(element)
        self.has_next.set()

    def add_multiple(self, elements):
        self.deque.extend(elements)
        self.has_next.set()

    async def get(self):
        await self.has_next.wait()
        instance = self.deque.popleft()
        if not self.deque:
            self.has_next.clear()
        return instance

    async def drain(self):
        while True:
            yield await self.get()


class SortedPipe:
    def __init__(self):
        self.queue = PriorityQueue()
        self.added_event = asyncio.Event()
        self.element_count = 0
        self.yield_count = 0

    def next_index(self):
        element_count = self.element_count
        self.element_count += 1
        return element_count

    def add(self, pos, element):
        self.queue.put((pos, element))
        self.added_event.set()

    async def _wait_for_new_element(self):
        self.added_event.clear()

    async def get(self):
        while True:
            await self.added_event.wait()
            try:
                count, entry = self.queue.get_nowait()
                if count == self.yield_count:
                    self.yield_count += 1
                    return entry
                else:
                    self.queue.put((count, entry))
                    self.added_event.clear()
            except Empty:
                self.added_event.clear()

    async def drain(self):
        while True:
            yield await self.get()
