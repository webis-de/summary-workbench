#!/usr/bin/env python3
"""
convert files where every line corresponds to one document/reference/model to jsonl
first argument: document file
second argument: reference file
all following arguments: model files
"""

import json
from pathlib import Path
from sys import argv

files = argv[1:]
if len(files) < 2:
    print("provide at least a document and reference file")
    exit(1)

args = [Path(file).read_text().splitlines() for file in files]
keys = ["document", "reference"] + [f"model{i+1}" for i in range(len(argv) - 2)]
lines = [dict(zip(keys, e)) for e in zip(*args)]
for line in lines:
    print(json.dumps(line, ensure_ascii=False))
