import React, { useRef, useState } from "react";

import { summarizeRequest, summarizers } from "../common/api";
import { markup } from "../common/fragcolors";
import { ComputeButton } from "./utils/ComputeButton";
import { RadioButtons } from "./utils/RadioButtons";
import { MarkupDisplayer } from "./utils/MarkupDisplayer";
import isURL from "is-url";

const Summarize = () => {
  const inputRef = useRef();
  const [isComputing, setIsComputing] = useState(false);
  const [generatedMarkup, setGeneratedMarkup] = useState(null);
  const [requestedMarkup, setRequestedMarkup] = useState(null);
  const [summarizer, setSummarizer] = useState(null);
  const [usedSummarizer, setUsedSummarizer] = useState(null);

  const compute = () => {
    const requestText = inputRef.current.value.trim();
    if (requestText === "") {
      alert("Please enter some text.");
      return;
    }
    setIsComputing(true);
    let textKind = "raw";
    if (isURL(requestText)) {
      textKind = "url";
    }
    const currSummarizer = summarizer;
    summarizeRequest(requestText, currSummarizer, textKind)
      .then(({ summary, original_text }) => {
        if (summary === "") {
          alert("No text could be generated. The input is probably too short.");
        } else {
          const [reqMarkup, genMarkup] = markup(original_text, summary);
          setUsedSummarizer(currSummarizer);
          setGeneratedMarkup(genMarkup);
          setRequestedMarkup(reqMarkup);
        }
      })
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <div className="uk-container">
      <textarea className="uk-textarea uk-margin" ref={inputRef} rows="8" placeholder="text or URL (https://...)" />

      <div className="uk-flex uk-flex-between uk-flex-wrap" style={{gridRowGap: "15px"}}>
        <RadioButtons
          buttonList={summarizers}
          onChange={(key) => setSummarizer(key)}
        />
        <ComputeButton
          isComputing={isComputing}
          onClick={compute}
        />
      </div>

      <MarkupDisplayer markupedText={generatedMarkup} name={"summary - " + usedSummarizer} />
      <MarkupDisplayer markupedText={requestedMarkup} name="original text" />
    </div>
  );
};

export { Summarize };
