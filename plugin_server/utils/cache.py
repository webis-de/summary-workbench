from hashlib import sha1
from itertools import chain

from cachetools import LRUCache


def interleave(l, value):
    l = iter(l)
    try:
        e = next(l)
        yield e
        while e := next(l):
            yield value
            yield e
    except StopIteration:
        pass


def chain_interleave(l, value):
    yield from chain.from_iterable(interleave(l, (value,)))


ESCAPE_CHARS = [b"'", b",", b"[", b"]", b"{", b"}", b"(", b")"]
REPLACEMENTS = [(e, b"\\" + e) for e in ESCAPE_CHARS]


def _bytes(data):
    data = data.replace(b"\\", b"\\\\")
    for char, repl in REPLACEMENTS:
        data = data.replace(char, repl)
    yield b"'"
    yield data
    yield b"'"


def _str_bytes(data):
    yield from _bytes(str(data).encode())


def _list_bytes(data):
    yield b"["  # ]
    yield from chain_interleave(map(to_bytes, data), b",")
    # [
    yield b"]"


def _set_bytes(data):
    iterator = (list(to_bytes(e)) for e in data)
    iterator = sorted(iterator)
    yield b"{"  # }
    yield from chain_interleave(iterator, b",")
    # {
    yield b"}"


def _dict_entry(key, value):
    yield b"("  # ")"
    yield from key
    yield b":"
    yield from value
    # "("
    yield b")"


def _dict_bytes(data):
    iterator = [(list(to_bytes(key)), value) for key, value in data.items()]
    iterator = sorted(iterator, key=lambda x: x[0])
    iterator = (_dict_entry(key, to_bytes(value)) for key, value in iterator)
    iterator = chain_interleave(iterator, b",")
    yield b"{"  # }
    yield from iterator
    yield b"}"


def _none_bytes(_):
    return b""


TYPES = {
    str: (b"str", _str_bytes),
    list: (b"list", _list_bytes),
    tuple: (b"list", _list_bytes),
    int: (b"int", _str_bytes),
    float: (b"float", _str_bytes),
    bytes: (b"bytes", _bytes),
    set: (b"set", _set_bytes),
    dict: (b"dict", _dict_bytes),
    type(None): (b"None", _none_bytes),
}


def to_bytes(data):
    data_type = type(data).mro()[-2]
    try:
        prefix, serializer = TYPES[data_type]
        yield prefix
        yield from serializer(data)
    except KeyError:
        raise ValueError(f"unsupported type {data_type}")


def to_hash(data, hash_function):
    hasher = hash_function()
    for b in to_bytes(data):
        hasher.update(b)
    return hasher.digest()


class Cache:
    def __init__(self, cache_size, hash_function=sha1):
        self.enabled = cache_size > 0
        self.cache = LRUCache(cache_size)
        self.hash_function = hash_function

    def hash(self, key):
        if not self.enabled:
            return b""
        return to_hash(key, self.hash_function)

    def set(self, key, value):
        if self.enabled:
            self.cache[to_hash(key, self.hash_function)] = value

    def get(self, key):
        if not self.enabled:
            raise KeyError()
        return self.cache[to_hash(key, self.hash_function)]
