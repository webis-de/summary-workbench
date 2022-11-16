import io
import os
from itertools import chain

import requests
from tqdm import tqdm


def wrap_file(fileobj, chunksize):
    while chunk := fileobj.read(chunksize):
        yield chunk


class TQDMFile(io.IOBase):
    def __init__(self, fileobj, size, *, name=None, chunksize=5 * 1024**2):
        self.last_chunk = b""
        self.chunk_iter = iter(
            tqdm(
                wrap_file(fileobj, chunksize),
                total=int(int(size) / chunksize + 1),
                desc=name,
            )
        )

    def readable(self):
        return True

    def read(self, n=None):
        chunk_iter = chain([self.last_chunk], self.chunk_iter)
        self.last_chunk = b""
        if n is None:
            chunks = list(chunk_iter)
        else:
            if not isinstance(n, int) or n < 0:
                raise ValueError("invalid size")
            chunks = []
            rest = n
            for chunk in chunk_iter:
                if len(chunk) > rest:
                    chunk, self.last_chunk = chunk[:rest], chunk[rest:]
                    chunks.append(chunk)
                    break
                chunks.append(chunk)
                rest -= len(chunk)
        return b"".join(chunks)


def get_stream(url, **kwargs):
    response = requests.get(url, stream=True)
    name = os.path.basename(url)
    return TQDMFile(
        response.raw, response.headers.get("content-length", 0), name=name, **kwargs
    )
