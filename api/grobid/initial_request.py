#!/usr/bin/env python3
import asyncio
from pathlib import Path

import aiohttp


async def grobid(pdf_stream):
    url = f"http://localhost:8070/api/processFulltextDocument"

    data = aiohttp.FormData()
    data.add_field("input", pdf_stream, filename="", content_type="application/pdf")
    data.add_field("generateIDs", "0")
    data.add_field("consolidateHeader", "0")
    data.add_field("consolidateCitations", "0")
    data.add_field("includeRawAffiliations", "0")
    data.add_field("includeRawCitations", "1")

    headers = {"Accept": "application/xml"}

    async with aiohttp.ClientSession() as session:
        async with session.post(url=url, data=data, headers=headers) as response:
            response.raise_for_status()
            return await response.text()


async def initial_request():
    path = Path(__file__).absolute().parent / "init.pdf"
    pdf_stream = path.read_bytes()
    await grobid(pdf_stream)


asyncio.run(initial_request())
