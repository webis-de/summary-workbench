import React, { useRef, useState } from "react";

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
          alert("No text could be generated. The input is probably too short.");
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
    <div className="uk-container">
      <textarea className="uk-textarea uk-margin" ref={inputRef} rows="12" />

      <div className="uk-flex uk-flex-between uk-flex-wrap" style={{gridRowGap: "15px"}}>
        <RadioButtons
          buttonList={summarizers}
          onChange={(key) => setSummarizer(key)}
        />
        <RadioButtons
          buttonList={summarizeKinds}
          onChange={(key) => setTextKind(key)}
        />
        <ComputeButton
          isComputing={isComputing}
          onClick={compute}
        />
      </div>

      <MarkupDisplayer markupedText={generatedMarkup} name="summary" />
      <MarkupDisplayer markupedText={requestedMarkup} name="original text" />
    </div>
  );
};

export { Summarize };
