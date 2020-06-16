import React, { useRef, useState } from "react";
import Container from "react-bootstrap/Container";
import FormControl from "react-bootstrap/FormControl";

import { summarizeKinds, summarizeRequest, summarizers } from "../common/api";
import { markup } from "../common/fragcolors";
import { ComputeButton } from "./utils/ComputeButton";
import { RadioButtons } from "./utils/RadioButtons";
import { MarkupDisplayer } from "./utils/MarkupDisplayer";


const Summarize = () => {
  const inputRef = useRef();
  const [isComputing, setIsComputing] = useState(false);
  const [generatedMarkup, setGeneratedMarkup] = useState(null);
  const [requestedMarkup, setRequestedMarkup] = useState(null);
  const [summarizer, setSummarizer] = useState(null);
  const [textKind, setTextKind] = useState(null);

  const compute = () => {
    const requestText = inputRef.current.value.trim();
    if (requestText === "") {
      alert("Please enter some text.");
      return;
    }
    setIsComputing(true);
    summarizeRequest(requestText, summarizer, textKind)
      .then(({ summary, original_text }) => {
        if (summary === "") {
          alert(
            "No text could be generated. The input is probably too short."
          );
        } else {
          const [reqMarkup, genMarkup] = markup(original_text, summary);
          setGeneratedMarkup(genMarkup);
          setRequestedMarkup(reqMarkup);
        }
      })
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <Container className="mb-5">
      <FormControl className="mb-3" ref={inputRef} as="textarea" rows="12" />

      <div className="mb-5 d-flex flex-column flex-lg-row justify-content-lg-between">
        <RadioButtons
          className="mb-2 mb-lg-0"
          buttonList={summarizers}
          onChange={(key) => setSummarizer(key)}
        />
        <RadioButtons
          className="mb-2 mb-lg-0"
          buttonList={summarizeKinds}
          onChange={(key) => setTextKind(key)}
        />
        <ComputeButton isComputing={isComputing} onClick={compute} />
      </div>

      <MarkupDisplayer markupedText={generatedMarkup} name="summary" />
      <MarkupDisplayer markupedText={requestedMarkup} name="original Text" />
    </Container>
  );
};

export { Summarize };
