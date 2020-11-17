import isURL from "is-url";
import React, { useReducer, useRef, useState } from "react";
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import UIkit from "uikit";

import { feedbackRequest, summarizeRequest, summarizers, summarizersDict } from "../api";
import { markup as genMarkup } from "../utils/fragcolors";
import { Markup } from "./Markup";
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

const ThumbsUp = withHover(FaThumbsUp, "green");
const ThumbsDown = withHover(FaThumbsDown, "red");

const Feedback = ({ summarizer, summary, reference, url }) => {
  const [submitted, setSubmitted] = useState(false);
  return submitted ? (
    <>Thanks for the Feedback!</>
  ) : (
    <div className="uk-small">
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
    </div>
  );
};

const OldSummarize = () => {
  const inputRef = useRef();
  const abstractiveRef = useRef();
  const extractiveRef = useRef();
  const [isComputing, setIsComputing] = useState(false);
  const [showHighlighting, toggleShowHighlighting] = useReducer((state) => !state, false);
  const [markups, setMarkups] = useState(null);
  const [percentage, setPercentage] = useState("15");

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
            const [requestMarkup, summaryMarkup] = genMarkup(original_text, summaryText);
            const currMarkup = { name, original_text, summaryText };
            currMarkup["summaryMarkup"] = generateParagraphs(summaryMarkup);
            currMarkup["requestMarkup"] = generateParagraphs(requestMarkup);
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
            {markups.map(({ name }) => (
              <li key={name}>
                <a style={{ fontSize: "1em" }} href="/#">
                  {summarizersDict[name]}
                </a>
              </li>
            ))}
          </ul>
          <ul id="summary-display" className="uk-switcher">
            {markups.map(
              ({ name, requestMarkup, summaryMarkup, summaryText, original_text, url }) => (
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
              )
            )}
          </ul>
        </>
      )}
    </div>
  );
};

const Header = ({ text, backgroundColor = "#B02F2C", children, style, ...props }) => (
  <div
    className="uk-flex uk-flex-between uk-flex-middle "
    style={{
      paddingLeft: "20px",
      paddingRight: "10px",
      paddingTop: "4px",
      paddingBottom : "4px",
      backgroundColor: backgroundColor,
      color: "white",
      ...style,
    }}
    {...props}
  >
    <div style={{ fontSize: "14pt" }}>{text}</div>
    {children}
  </div>
);

const Checkbox = ({ is_set, readable, onClick }) => (
  <label style={{ padding: "5px" }}>
    <input
      className="uk-checkbox uk-margin-small-right"
      checked={is_set}
      readOnly={true}
      onClick={onClick}
      type="checkbox"
    />
    {readable}
  </label>
);

const initModels = (models) => {
  const init = {};
  for (const [option, readable] of models) {
    init[option] = { is_set: false, readable };
  }
  return init;
};

const extractive = initModels(summarizers["extractive"]);
const abstractive = initModels(summarizers["abstractive"]);

const Checkboxes = ({ className, options, toggleOption }) => (
  <div className="uk-flex uk-flex-column">
    {Object.entries(options).map(([option, { is_set, readable }]) => (
      <Checkbox
        key={option}
        readable={readable}
        is_set={is_set}
        onClick={() => toggleOption(option)}
      />
    ))}
  </div>
);

const toggleSettingReducer = (settings, metric) => {
  const newSettings = Object.assign({}, settings);
  newSettings[metric].is_set = !newSettings[metric].is_set;
  return newSettings;
};

const getSetModels = (models) =>
  Object.entries(models)
    .filter((e) => e[1].is_set)
    .map((e) => e[0]);

const Loading = () => <div data-uk-spinner />;

const InputDocument = ({ summarize, isComputing }) => {
  const textRef = useRef();
  const [abstractiveModels, toggleAbstractiveModel] = useReducer(toggleSettingReducer, abstractive);
  const [extractiveModels, toggleExtractiveModel] = useReducer(toggleSettingReducer, extractive);
  const [percentage, setPercentage] = useState("15");

  return (
    <div className="uk-container uk-container-expand">
      <div className="uk-flex uk-flex-between">
        <div style={{ flexBasis: "60%" }}>
          <Header text="Document"></Header>
          <textarea
            ref={textRef}
            className="uk-textarea"
            rows="8"
            placeholder="Paste URL or long text"
            style={{ padding: "10pt", height: "30em", border: "1px solid grey", borderTop: null }}
          />
        </div>
        <div style={{ flexBasis: "37%" }}>
          <div className="uk-flex uk-flex-column uk-flex between" style={{ height: "100%" }}>
            <div style={{ flex: "1" }}>
              <Header text="Models" />
              <div className="uk-margin"></div>
              <div className="uk-flex uk-flex-between">
                <div style={{ flexBasis: "48%" }}>
                  <Header
                    text="Abstractive"
                    backgroundColor="green"
                    style={{ fontVariant: "small-caps" }}
                  />
                  <Checkboxes options={abstractive} toggleOption={toggleAbstractiveModel} />
                </div>
                <div style={{ flexBasis: "48%" }}>
                  <Header
                    text="Extractive"
                    backgroundColor="green"
                    style={{ fontVariant: "small-caps" }}
                  />
                  <Checkboxes options={extractive} toggleOption={toggleExtractiveModel} />
                </div>
              </div>
            </div>
            <div className="uk-flex uk-flex-between uk-flex-bottom" style={{ alignSelf: "bottom" }}>
              <div className="uk-flex uk-flex-column">
                <div style={{ flex: 1 }} className="uk-text-small uk-flex uk-flex-between">
                  <span>Summary length</span>
                  <span className="uk-label" style={{ width: "25pt", textAlign: "right" }}>
                    {percentage + "%"}
                  </span>
                </div>
                <div className="uk-margin-small" />
                <input
                  type="range"
                  min="5"
                  max="25"
                  defaultValue={percentage}
                  onChange={(e) => setPercentage(e.currentTarget.value)}
                />
              </div>
              {isComputing ? (
                <Loading />
              ) : (
                <button
                  className="uk-button-primary"
                  style={{ padding: "8pt", alignSelf: "bottom", flexGrow: 0.5 }}
                  onClick={() =>
                    summarize(
                      textRef.current.value,
                      getSetModels(abstractiveModels).concat(getSetModels(extractiveModels)),
                      percentage
                    )
                  }
                >
                  Summarize
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Statistics = ({ statistics }) => (
  <table className="uk-table uk-table-divider uk-table-small uk-table-middle">
    <thead>
      <tr>
        <th>Name</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(statistics).map(([name, value]) => (
        <tr>
          <td>{name}</td>
          <td>{value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Summary = ({ data, onHighlight, showMarkup }) => {
  const { name, summaryMarkup, summaryText, original_text, url, statistics } = data;
  const [showStatistics, toggleShowStatistics] = useReducer((oldState) => !oldState, false);

  return (
    <div
      className="uk-margin summary-border"
      
    >
      <h1 style={{paddingTop:"12px"}} className="uk-card-title uk-text-capitalize uk-flex uk-flex-between">
        {name}
        <div className="uk-flex">
          <button
            className={showStatistics ? "uk-button-secondary" : "uk-button-primary"}
            onClick={() => toggleShowStatistics()}
            style={{ marginRight: "10pt" }}
          >
            {showStatistics ? "hide statistics" : "show statistics"}
          </button>
          <button
            className={showMarkup ? "uk-button-secondary" : "uk-button-primary"}
            onClick={onHighlight}
          >
            {showMarkup ? "hide highlighting" : "show highlighting"}
          </button>
        </div>
      </h1>
      {showStatistics && <Statistics statistics={statistics} />}
      {summaryMarkup.map((markupedText, i) => (
        <p key={i}>
          <Markup markupedText={markupedText} showMarkup={showMarkup} />
        </p>
      ))}
      <div className="uk-flex uk-flex-right">
        <Feedback
          key={summaryText}
          summarizer={name}
          summary={summaryText}
          reference={original_text}
          url={url}
        />
      </div>
    </div>
  );
};

const Document = ({ markup, showMarkup }) => (
  <div
    className="uk-card uk-card-default uk-card-body document-border"
  >
    {markup.map((markupedText, i) => (
      <p key={i}>
        <Markup markupedText={markupedText} showMarkup={showMarkup} />
      </p>
    ))}
  </div>
);

const SummaryView = ({ markups, setMarkups }) => {
  const [markupIndex, highlight] = useReducer(
    (oldIndex, newIndex) => (oldIndex === newIndex ? null : newIndex),
    null
  );

  return (
    <div className="uk-container uk-container-expand">
      <div className="uk-flex uk-flex-between">
        <div style={{ flexBasis: "48%", flexGrow: 0 }}>
          <Header text="Document" >
            <button className="uk-button-primary" onClick={() => setMarkups(null)}>Clear</button>
          </Header>
          <Document
            markup={
              markupIndex !== null
                ? markups[markupIndex]["requestMarkup"]
                : markups[0]["requestMarkup"]
            }
            showMarkup={markupIndex !== null}
          />
        </div>
        <div style={{ flexBasis: "48%", flexGrow: 0 }}>
          <div style={{ position: "sticky", top: "100px" }}>
            <Header text="Summaries" />
            <div style={{height: "calc(100vh - 145px)" }} className="uk-card uk-card-default uk-card-body" >
              {markups.map((markup, index) => (
                <Summary
                  data={markup}
                  showMarkup={index === markupIndex}
                  onHighlight={() => highlight(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const generateStatistics = (text) => {
  return {
    numWhitespace: [...text.matchAll(/\s/g)].length,
    numPunctuation: [...text.matchAll(/[^\s\w]/g)].length,
    numNumber: [...text.matchAll(/\d/g)].length,
    numWords: [...text.matchAll(/[a-zA-Z]+/g)].length,
  };
};

const Summarize = () => {
  const [markups, setMarkups] = useState(null);
  const [computing, setComputing] = useState(null);

  const summarize = (rawText, models, percentage) => {
    const text = rawText.trim();
    const kind = isURL(text) ? "url" : "raw";
    const ratio = parseInt(percentage) / 100;

    if (!models.length) {
      UIkit.notification({ message: "No summarizer selected", status: "danger", pos: "top-left" });
    } else if (!text) {
      UIkit.notification({ message: "Please enter some text.", status: "danger", pos: "top-left" });
    } else {
      setComputing(true);
      summarizeRequest(text, models, ratio, kind)
        .then(({ summaries, original_text }) => {
          if (Object.values(summaries).every((summaryText) => summaryText === "")) {
            UIkit.notification({
              message: "No summaries could be generated. The input is probably too short.",
              status: "danger",
              pos: "top-left",
            });
          } else {
            const newMarkups = [];
            for (const [name, summaryText] of Object.entries(summaries)) {
              const [requestMarkup, summaryMarkup] = genMarkup(original_text, summaryText);
              newMarkups.push({
                name,
                original_text,
                summaryText,
                summaryMarkup: generateParagraphs(summaryMarkup),
                requestMarkup: generateParagraphs(requestMarkup),
                statistics: generateStatistics(summaryText),
                url: isURL(text) ? text : null,
              });
            }
            newMarkups.sort((a, b) => a["name"] > b["name"]);
            setMarkups(newMarkups);
          }
        })
        .finally(() => setComputing(false))
        .catch((e) => alert(e));
    }
  };

  if (markups) {
    return <SummaryView markups={markups} setMarkups={setMarkups} />;
  } else {
    return <InputDocument summarize={summarize} isComputing={computing} />;
  }
};

export { Summarize };
