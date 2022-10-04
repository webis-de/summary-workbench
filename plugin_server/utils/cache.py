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


def _bytes(data):
    yield data


def _str_bytes(data):
    yield str(data).encode()


def _list_bytes(data):
    yield b"["
    data = map(to_bytes, data)
    yield from chain_interleave(data, b",")
    yield b"]"


def _set_bytes(data):
    yield b"s{"
    yield from sorted(_list_bytes(data))
    yield b"}"


def _dict_bytes(data):
    key_bytes = _list_bytes(data.keys())
    value_bytes = _list_bytes(data.values())
    yield b"{"
    for key, value in sorted(zip(key_bytes, value_bytes), key=lambda x: x[0]):
        yield key
        yield value
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


def to_hash(data):
    hasher = sha1()
    for b in to_bytes(data):
        hasher.update(b)
    return hasher.digest()


class Cache:
    def __init__(self, cache_size):
        self.enabled = cache_size > 0
        self.cache = LRUCache(cache_size)

    def hash(self, key):
        if not self.enabled:
            return b""
        return to_hash(key)

    def set(self, key, value):
        if self.enabled:
            self.cache[to_hash(key)] = value

    def get(self, key):
        if not self.enabled:
            raise KeyError()
        return self.cache[to_hash(key)]
