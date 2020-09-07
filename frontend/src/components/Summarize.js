import isURL from "is-url";
import React, { useReducer, useRef, useState } from "react";

import { summarizeRequest, summarizers } from "../api";
import { markup } from "../utils/fragcolors";
import { Button } from "./utils/Button";
import { ComputeButton } from "./utils/ComputeButton";
import { MarkupDisplayer } from "./utils/MarkupDisplayer";

const Summarize = () => {
  const inputRef = useRef();
  const selectRef = useRef();
  const [isComputing, setIsComputing] = useState(false);
  const [showHighlighting, toggleShowHighlighting] = useReducer((state) => !state, false);
  const [markups, setMarkups] = useState(null);
  const [percentage, setPercentage] = useState("15");

  const generateParagraphs = (markupedText) => {
    const paragraphedText = [];
    let currParagraph = [];
    for (const [text, classes] of markupedText) {
      const splits = text.split("\n\n");
      while (true) {
        currParagraph.push([splits.shift(), classes]);
        if (splits.length > 0) {
          paragraphedText.push(currParagraph);
          currParagraph = [];
        } else {
          break;
        }
      }
    }
    if (currParagraph.length > 0) {
      paragraphedText.push(currParagraph);
    }
    return paragraphedText;
  };

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
    const selectedSummarizers = Object.values(selectRef.current.selectedOptions).map(
      (option) => summarizers[option.index][0]
    );
    if (selectedSummarizers.length === 0) {
      alert("No summarizer selected");
      return;
    }
    setIsComputing(true);
    summarizeRequest(requestText, selectedSummarizers, parseInt(percentage) / 100, textKind)
      .then(({ summaries, original_text }) => {
        if (Object.values(summaries).every((summaryText) => summaryText === "")) {
          alert("No summaries could be generated. The input is probably too short.");
        } else {
          const newMarkups = [];
          for (const [name, summaryText] of Object.entries(summaries)) {
            const [requestMarkup, summaryMarkup] = markup(original_text, summaryText);
            newMarkups.push([
              name,
              generateParagraphs(requestMarkup),
              generateParagraphs(summaryMarkup),
            ]);
          }
          newMarkups.sort();
          setMarkups(newMarkups);
        }
      })
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <div className="uk-container">
      <textarea
        className="uk-textarea uk-margin"
        ref={inputRef}
        rows="8"
        placeholder="Enter some long text or a URL (https://...)"
      />
      <div className="uk-flex">
        <div className="left-border-thin"
          >
            <h5 className="uk-text-small uk-margin-left">Select models</h5>
            <select ref={selectRef} className="uk-select uk-margin-left" multiple style={{ width: "12em" }} size={3}>
              {summarizers.map(([name, readable]) => (
                <option key={name}>{readable}</option>
              ))}
            </select>
          </div>

          <div className="left-border-thin uk-width-small uk-margin-left">
          <h5 className="uk-text-small uk-margin-left">Summary length
          <span className="uk-label">{percentage + "%"}</span> 
          </h5>
          <input
                className="uk-margin-left"
                type="range"
                min="5"
                max="25"
                defaultValue={percentage}
                onChange={(e) => setPercentage(e.currentTarget.value)}
            />
        </div>
        </div>
        <div className="uk-float-right">
          <ComputeButton isComputing={isComputing} onClick={compute} methodCalled={"Summarize"} />
          <span className="uk-margin-left"></span>
          <Button
            disabled={markups === null}
            variant={showHighlighting ? "primary" : "default"}
            onClick={() => toggleShowHighlighting()}
          >
            highlight
          </Button>
        </div>

      {markups !== null && (
        <>
          <ul className="uk-tab uk-margin" data-uk-tab uk-tab="connect: #summary-display;">
            {markups.map((m) => (
              <li>
                <a style={{ fontSize: "1em" }} href="/#">{m[0]}</a>
              </li>
            ))}
          </ul>
          <ul id="summary-display" className="uk-switcher">
            {markups.map(([name, requestText, summaryText]) => (
              <li>
                <MarkupDisplayer
                  paragraphedText={summaryText}
                  name="summary"
                  showMarkup={showHighlighting}
                  maxHeight="300px"
                  minHeight="300px"
                />
                <MarkupDisplayer
                  paragraphedText={requestText}
                  name="original text"
                  showMarkup={showHighlighting}
                  maxHeight="1000px"
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export { Summarize };
