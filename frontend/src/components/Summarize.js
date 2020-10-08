import isURL from "is-url";
import React, { useReducer, useRef, useState } from "react";
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";

import { feedbackRequest, summarizeRequest, summarizers, summarizersDict } from "../api";
import { markup } from "../utils/fragcolors";
import { Button } from "./utils/Button";
import { ComputeButton } from "./utils/ComputeButton";
import { MarkupDisplayer } from "./utils/MarkupDisplayer";
import { Section } from "./utils/Section";

const selectToName = (ref, summs) => {
  return Object.values(ref.current.selectedOptions).map((option) => summs[option.index][0]);
};

const withHover = (WrappedComponent, color) => (props) => {
  const [hovered, setHovered] = useState(false);
  return (
    <WrappedComponent
      {...props}
      style={{ color: hovered ? color : "" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
};

const ThumbsUp = withHover(FaThumbsUp, "blue");
const ThumbsDown = withHover(FaThumbsDown, "red");

const Feedback = ({ summarizer, summary, reference, url }) => {
  const [submitted, setSubmitted] = useState(false);
  return submitted ? (
    <>Thanks for the Feedback!</>
  ) : (
    <>
      Good Summary?
      <ThumbsUp
        className="uk-margin-left"
        onClick={() =>
          feedbackRequest(summarizer, summary, reference, url, "good")
            .then(() => setSubmitted(true))
            .catch((e) => alert(e))
        }
      />
      <ThumbsDown
        className="uk-margin-small-left"
        onClick={() =>
          feedbackRequest(summarizer, summary, reference, url, "bad")
            .then(() => setSubmitted(true))
            .catch((e) => alert(e))
        }
      />
    </>
  );
};

const Summarize = () => {
  const inputRef = useRef();
  const abstractiveRef = useRef();
  const extractiveRef = useRef();
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
    const selectedSummarizers = selectToName(abstractiveRef, summarizers["abstractive"]).concat(
      selectToName(extractiveRef, summarizers["extractive"])
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
            const currMarkup = {name, original_text, summaryText}
            currMarkup["summaryMarkup"] = generateParagraphs(summaryMarkup)
            currMarkup["requestMarkup"] = generateParagraphs(requestMarkup)
            currMarkup["url"] = isURL(requestText) ? requestText : null;
            newMarkups.push(currMarkup);
          }
          newMarkups.sort((a, b) => a["name"] > b["name"]);
          setMarkups(newMarkups);
        }
      })
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <div className="uk-container">
      <Section title={"Select models"}>
        <div className="uk-column-1-2">
          <div className="uk-flex-grow">
            <h3 className="uk-text-small" style={{ textTransform: "capitalize" }}>
              abstractive models
            </h3>
            <div>
              <select ref={abstractiveRef} className="uk-select" multiple size={5}>
                {summarizers["abstractive"].map(([name, readable]) => (
                  <option key={name}>{readable}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <h3 className="uk-text-small" style={{ textTransform: "capitalize" }}>
              extractive models
            </h3>
            <div>
              <select ref={extractiveRef} className="uk-select" multiple size={5}>
                {summarizers["extractive"].map(([name, readable]) => (
                  <option key={name}>{readable}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Section>
      <div className="uk-flex"></div>
      <textarea
        className="uk-textarea uk-margin"
        ref={inputRef}
        rows="8"
        placeholder="Enter some long text or a URL (https://...)"
      />
      <div className="uk-flex uk-flex-between uk-flex-bottom">
        <div className="left-border-thin uk-width-small uk-margin-left">
          <h5 className="uk-text-small uk-margin-left">
            Summary length
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
        <div className="uk-margin-left">
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
      </div>

      {markups !== null && (
        <>
          <ul className="uk-tab uk-margin" data-uk-tab uk-tab="connect: #summary-display;">
            {markups.map(({name}) => (
              <li key={name}>
                <a style={{ fontSize: "1em" }} href="/#">
                  {summarizersDict[name]}
                </a>
              </li>
            ))}
          </ul>
          <ul id="summary-display" className="uk-switcher">
            {markups.map(({name, requestMarkup, summaryMarkup, summaryText, original_text, url}) => (
              <li key={name}>
                <MarkupDisplayer
                  paragraphedText={summaryMarkup}
                  name="summary"
                  showMarkup={showHighlighting}
                  maxHeight="300px"
                  minHeight="300px"
                />
                <div className="uk-flex uk-flex-right">
                  <Feedback
                    key={summaryText}
                    summarizer={name}
                    summary={summaryText}
                    reference={original_text}
                    url={url}
                  />
                </div>
                <MarkupDisplayer
                  paragraphedText={requestMarkup}
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
