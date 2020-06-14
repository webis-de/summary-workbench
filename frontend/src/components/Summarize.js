import React, { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Container from "react-bootstrap/Container";
import FormControl from "react-bootstrap/FormControl";
import Spinner from "react-bootstrap/Spinner";
import { FaArrowAltCircleDown } from "react-icons/fa";

import { bertSummarizerRequest, textRankRequest } from "../common/api";
import { markup } from "../common/fragcolors";
import { Markup } from "./Markup";

const Summarize = () => {
  const inputRef = useRef();
  const [isComputing, setIsComputing] = useState(false);
  const [generatedMarkup, setGeneratedMarkup] = useState(null);
  const [requestedMarkup, setRequestedMarkup] = useState(null);
  const [summarizeRequester, setSummarizeRequester] = useState(
    () => textRankRequest
  );

  const compute = () => {
    const requestText = inputRef.current.value;
    if (requestText.trim() === "") {
      alert("Please enter some text.");
      return
    }
    setIsComputing(true);
    summarizeRequester(requestText)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("failure with Request");
        }
      })
      .then(({ text }) => {
        if (text === "") {
          alert("No text could be generated. Maybe the input is not valid for the choosen summarizer.")
        } else {
          const [reqMarkup, genMarkup] = markup(requestText, text);
          setGeneratedMarkup(genMarkup);
          setRequestedMarkup(reqMarkup);
        }
      })
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <Container>
      <FormControl className="mb-3" ref={inputRef} as="textarea" rows="12" />

      <div className="mb-2 d-flex flex-column flex-md-row justify-content-md-between">
        <ButtonGroup className="mb-2 mb-md-0">
          <Button
            variant={
              summarizeRequester === textRankRequest ? "primary" : "secondary"
            }
            size="lg"
            onClick={() => setSummarizeRequester(() => textRankRequest)}
          >
            TextRank
          </Button>
          <Button
            variant={
              summarizeRequester === bertSummarizerRequest
                ? "primary"
                : "secondary"
            }
            size="lg"
            onClick={() => setSummarizeRequester(() => bertSummarizerRequest)}
          >
            BertSummarizer
          </Button>
        </ButtonGroup>
        {isComputing ? (
          <Spinner className="m-2" animation="border" size="lg" />
        ) : (
          <Button
            className="d-flex justify-content-center align-items-center"
            variant="success"
            size="lg"
            onClick={compute}
          >
            <FaArrowAltCircleDown className="mr-2" />
            Generate
          </Button>
        )}
      </div>

      {generatedMarkup !== null && requestedMarkup !== null && (<>
        <hr />
        <h6 className="d-flex flex-row justify-content-center">summary</h6>
        <Markup className="mt-3 p-4 border" markupedText={generatedMarkup} />
        <hr />
        <h6 className="d-flex flex-row justify-content-center">original text</h6>
        <Markup className="mt-3 p-4 border" markupedText={requestedMarkup} />
        </>
      )}
    </Container>
  );
};

export { Summarize };
