#!/usr/bin/env python3
import base64
from sys import argv

import aiohttp
import uvicorn
from bs4 import BeautifulSoup
from doc2json.grobid2json.tei_to_json import convert_tei_xml_soup_to_s2orc_json
from fastapi import FastAPI, Response
from pydantic import BaseModel


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


async def process_pdf(pdf_stream):
    xml = await grobid(pdf_stream)
    soup = BeautifulSoup(xml, "xml")
    return convert_tei_xml_soup_to_s2orc_json(soup, "", "").release_json("pdf")


app = FastAPI()


class Body(BaseModel):
    pdf: str


@app.post("/")
async def pdf(body: Body, response: Response):
    try:
        stream = base64.b64decode(body.pdf)
        return {"json": await process_pdf(stream)}
    except aiohttp.ClientResponseError as e:
        response.status_code = e.status
        return {"message": e.message}


@app.get("/")
async def health():
    return Response(status_code=200)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(argv[1]))
