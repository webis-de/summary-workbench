import React, { useRef, useState, useReducer } from "react";

import { summarizeRequest, summarizers } from "../api";
import { markup } from "../utils/fragcolors";
import { Button } from "./utils/Button";
import { ComputeButton } from "./utils/ComputeButton";
import { RadioButtons } from "./utils/RadioButtons";
import { MarkupDisplayer } from "./utils/MarkupDisplayer";
import isURL from "is-url";

const Summarize = () => {
  const inputRef = useRef();
  const [isComputing, setIsComputing] = useState(false);
  const [showHighlighting, toggleShowHighlighting] = useReducer((state) => !state, true)
  const [generatedMarkup, setGeneratedMarkup] = useState(null);
  const [requestedMarkup, setRequestedMarkup] = useState(null);
  const [summarizer, setSummarizer] = useState(null);
  const [usedSummarizer, setUsedSummarizer] = useState(null);

  const generateParagraphs = (markupedText) => {
    const paragraphedText = []
    let currParagraph = []
    for (const [text, classes] of markupedText) {
      const splits = text.split("\n\n")
      while (true) {
        currParagraph.push([splits.shift(), classes])
        if (splits.length > 0) {
          paragraphedText.push(currParagraph)
          currParagraph = []
        } else {
          break
        }
      }
    }
    if (currParagraph.length > 0) {
      paragraphedText.push(currParagraph)
    }
    return paragraphedText
  }

  const compute = () => {
    const requestText = inputRef.current.value.trim();
    if (requestText === "") {
      alert("Please enter some text.");
      return;
    }
    let textKind = "raw";
    if (isURL(requestText)) {
      textKind = "url";
    }
    const currSummarizer = summarizer;
    if (currSummarizer === null) {
      alert("No summarizer selected")
      return
    }
    setIsComputing(true);
    summarizeRequest(requestText, currSummarizer, textKind)
      .then(({ summary, original_text }) => {
        if (summary === "") {
          alert("No summary could be generated. The input is probably too short.");
        } else {
          const [reqMarkup, genMarkup] = markup(original_text, summary);
          setUsedSummarizer(currSummarizer);
          setGeneratedMarkup(generateParagraphs(genMarkup));
          setRequestedMarkup(generateParagraphs(reqMarkup));
        }
      })
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <div className="uk-container">
      <textarea className="uk-textarea uk-margin" ref={inputRef} rows="8" placeholder="Enter some long text or a URL (https://...)" />

      <div className="uk-flex uk-flex-between uk-flex-wrap" style={{gridRowGap: "15px"}}>
        <RadioButtons
          buttonList={summarizers}
          onChange={(key) => setSummarizer(key)}
          defaultIndex={null}
        />
        <ComputeButton
          isComputing={isComputing}
          onClick={compute}
          methodCalled={"Summarize"}
        />
      </div>

      <MarkupDisplayer paragraphedText={generatedMarkup} name={"Summary : " + usedSummarizer} showMarkup={showHighlighting} />
      <MarkupDisplayer paragraphedText={requestedMarkup} name="Long text" showMarkup={showHighlighting}/>
      <Button variant={showHighlighting ? "primary" : "default"} onClick={() => toggleShowHighlighting()} style={{position: "fixed", bottom: 20, right: 20}}>
        highlight
      </Button>
    </div>
  );
};

export { Summarize };
