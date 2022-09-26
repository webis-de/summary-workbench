import aiohttp
from bs4 import BeautifulSoup
from doc2json.grobid2json.tei_to_json import convert_tei_xml_soup_to_s2orc_json


class GrobidError(Exception):
    pass


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


def group_sections(pdf_json):
    title, abstract = pdf_json["title"], pdf_json["abstract"]
    sections = []
    curr_section = None
    for value in pdf_json["pdf_parse"]["body_text"]:
        text = value["text"]
        section = value.get("section")
        sec_num = value.get("sec_num")
        if section is None and section is None:
            continue
        if curr_section is not None:
            if curr_section["secNum"] is not None:
                if sec_num is not None or section is None:
                    if curr_section["secNum"] != sec_num or (
                        section is not None
                        and curr_section.get("section") is not None
                        and curr_section["section"] != section
                    ):
                        sections.append(curr_section)
                        curr_section = None
            elif section and (sec_num or curr_section["section"] != section):
                sections.append(curr_section)
                curr_section = None
        if curr_section is None:
            curr_section = {"section": section, "secNum": sec_num, "texts": []}
        if curr_section.get("section") is not None:
            if section is not None and curr_section["section"] != section:
                text = f"{section}\n{text}"
        elif section is not None:
            curr_section["section"] = section
        curr_section["texts"].append(text)
    if curr_section is not None:
        sections.append(curr_section)
    return {"title": title, "abstract": abstract, "sections": sections}


async def extract_pdf(pdf_stream):
    try:
        xml = await grobid(pdf_stream)
    except aiohttp.ClientResponseError as e:
        raise GrobidError(f"Grobid failed with status code {e.status}")

    soup = BeautifulSoup(xml, "xml")
    pdf_json = convert_tei_xml_soup_to_s2orc_json(soup, "", "").release_json("pdf")
    sections = group_sections(pdf_json)
    return sections
