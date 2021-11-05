import React, { useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";

import { feedbackRequest, summarizeRequest } from "../api";
import { SettingsContext } from "../contexts/SettingsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { useMarkups, usePairwiseMarkups } from "../hooks/markup";
import { displayError, displayMessage } from "../utils/message";
import { PluginCard } from "./utils/PluginCard";
import { ModelGrid } from "./Model";
import { Badge, DismissableBadge } from "./utils/Badge";
import { Button } from "./utils/Button";
import { Card, CardBody, CardHeader, CardTitle } from "./utils/Card";
import { LiveSearch, useFilter } from "./utils/FuzzySearch";
import { Bars, EyeClosed, EyeOpen, ThumbsDown, ThumbsUp } from "./utils/Icons";
import { CenterLoading } from "./utils/Loading";
import { Markup, useMarkupScroll } from "./utils/Markup";

const Feedback = ({ summary }) => {
  const { name, summaryText, originalText, url } = summary;
  const sendFeedback = (feedback) =>
    feedbackRequest(name, summaryText, originalText, url, feedback);
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return <>Thanks for the Feedback!</>;
  return (
    <div className="uk-small">
      <span className="colored-header"> Good Summary?</span>
      <ThumbsUp
        className="uk-margin-left"
        onClick={() =>
          sendFeedback("good")
            .then(() => setSubmitted(true))
            .catch(displayError)
        }
      />
      <ThumbsDown
        className="uk-margin-small-left"
        onClick={() =>
          sendFeedback("bad")
            .then(() => setSubmitted(true))
            .catch(displayError)
        }
      />
    </div>
  );
};

const Header = ({ text, fontSize, backgroundColor = "#B02F2C", children, style }) => (
  <div
    className="uk-flex uk-flex-between uk-flex-middle margin-between-20"
    style={{
      paddingLeft: "20px",
      paddingRight: "10px",
      paddingTop: "10px",
      fontWeight: "500",
      paddingBottom: "12px",
      backgroundColor,
      color: "white",
      fontSize,
      ...style,
    }}
  >
    {text && <div style={{ fontSize }}>{text}</div>}
    {children}
  </div>
);

const getChosenModels = (models) =>
  Object.entries(models)
    .filter((e) => e[1])
    .map((e) => e[0]);

const Loading = () => <div data-uk-spinner />;

const sampleText = `Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist. Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine, which can be considered a model of a general-purpose computer. Turing is widely considered to be the father of theoretical computer science and artificial intelligence. Despite these accomplishments, he was never fully recognised in his home country, if only because much of his work was covered by the Official Secrets Act.
During the Second World War, Turing worked for the Government Code and Cypher School (GC&CS) at Bletchley Park, Britain's codebreaking centre that produced Ultra intelligence. For a time he led Hut 8, the section that was responsible for German naval cryptanalysis. Here, he devised a number of techniques for speeding the breaking of German ciphers, including improvements to the pre-war Polish bombe method, an electromechanical machine that could find settings for the Enigma machine.
Turing played a crucial role in cracking intercepted coded messages that enabled the Allies to defeat the Nazis in many crucial engagements, including the Battle of the Atlantic. Due to the problems of counterfactual history, it is hard to estimate the precise effect Ultra intelligence had on the war, but Professor Jack Copeland has estimated that this work shortened the war in Europe by more than two years and saved over 14 million lives.
After the war, Turing worked at the National Physical Laboratory, where he designed the Automatic Computing Engine. The Automatic Computing Engine was one of the first designs for a stored-program computer. In 1948, Turing joined Max Newman's Computing Machine Laboratory, at the Victoria University of Manchester, where he helped develop the Manchester computers and became interested in mathematical biology. He wrote a paper on the chemical basis of morphogenesis and predicted oscillating chemical reactions such as the Belousov–Zhabotinsky reaction, first observed in the 1960s.
Turing was prosecuted in 1952 for homosexual acts; the Labouchere Amendment of 1885 had mandated that "gross indecency" was a criminal offence in the UK. He accepted chemical castration treatment, with DES, as an alternative to prison. Turing died in 1954, 16 days before his 42nd birthday, from cyanide poisoning. An inquest determined his death as a suicide, but it has been noted that the known evidence is also consistent with accidental poisoning.
In 2009, following an Internet campaign, British Prime Minister Gordon Brown made an official public apology on behalf of the British government for "the appalling way he was treated". Queen Elizabeth II granted Turing a posthumous pardon in 2013. The "Alan Turing law" is now an informal term for a 2017 law in the United Kingdom that retroactively pardoned men cautioned or convicted under historical legislation that outlawed homosexual acts.`;

const InputDocument = ({ summarize, isComputing }) => {
  const [documentText, setDocumentText] = useState("");
  const { summarizers, settings, toggleSetting } = useContext(SummarizersContext);
  const { summaryLength } = useContext(SettingsContext);
  const summarizerKeys = useMemo(() => Object.keys(summarizers).sort(), [summarizers]);
  const { query, setQuery, filteredKeys } = useFilter(summarizerKeys);
  const [selectedSummarizer, setSelectedSummarizer] = useState(null);
  const selectSummarizer = (key) => {
    if (settings[key]) setSelectedSummarizer(null);
    else setSelectedSummarizer(key);
    toggleSetting(key);
  };
  const unselectSummarizer = (key) => {
    toggleSetting(key);
    if (selectedSummarizer === key) setSelectedSummarizer(null);
  };

  const chosenModels = getChosenModels(settings);

  const insertSampleText = () => {
    setDocumentText(sampleText);
  };

  return (
    <div className="uk-margin-medium-top@s uk-margin-large-top@l">
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gridGap: "10px" }}>
        <div>
          <div className="uk-flex uk-flex-column">
            <Header text="Document" fontSize="14pt">
              <Button variant="primary" onClick={insertSampleText}>
                sample text
              </Button>
            </Header>
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.currentTarget.value)}
              className="uk-textarea uk-card uk-card-default uk-card-body"
              rows="8"
              placeholder="Paste URL or long text"
              style={{ minHeight: "350px", padding: "20px", resize: "none", overflow: "auto" }}
            />
          </div>
        </div>

        <div className="uk-flex uk-flex-column">
          <Card>
            <CardHeader>
              <CardTitle style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
                <span style={{ marginRight: "10px" }}>Models</span>
                <LiveSearch query={query} setQuery={setQuery} />
              </CardTitle>
            </CardHeader>
            <CardBody>
              <ModelGrid
                keys={filteredKeys}
                models={summarizers}
                settings={settings}
                selectModel={selectSummarizer}
              />
              <div style={{marginTop: "30px"}} />
              <span className="colored-header">summary length:</span> {`${summaryLength} %`}
              <div
                className="uk-flex uk-flex-wrap"
                style={{
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                  <span className="colored-header">selected:</span>
                  {chosenModels.map((model) => (
                    <DismissableBadge onClick={() => unselectSummarizer(model)} key={model}>
                      <a
                        href="/#"
                        className="nostyle"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedSummarizer(model);
                        }}
                      >
                        {summarizers[model].name}
                      </a>
                    </DismissableBadge>
                  ))}
              </div>
              {selectedSummarizer && (
                <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                  <PluginCard plugin={summarizers[selectedSummarizer]} inline={false} />
                </div>
              )}
              <div className="uk-flex uk-flex-center" style={{ marginTop: "40px" }}>
                {isComputing ? (
                  <Loading />
                ) : (
                  <button
                    className="uk-button uk-button-primary"
                    disabled={!documentText || !chosenModels.length}
                    onClick={() => summarize(documentText, chosenModels, summaryLength)}
                  >
                    Summarize
                  </button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

const computeNumWords = (text) => [...text.matchAll(/[a-zA-Z]+/g)].length;

const generateStatistics = (text, summaryMarkup) => {
  const numWords = computeNumWords(text);
  let numMarkupedWords = numWords;
  summaryMarkup.forEach((subtext) => {
    if (typeof subtext === "string") numMarkupedWords -= computeNumWords(subtext);
  });
  return {
    numWords,
    percentOverlap: numWords ? numMarkupedWords / numWords : 0,
  };
};

const Summary = ({ markup, summary, markupState, scrollState, showMarkup }) => {
  const { summaryText } = summary;
  const { numWords, percentOverlap } = useMemo(
    () => generateStatistics(summaryText, markup[1]),
    [markup, summaryText]
  );

  return (
    <div>
      <div className="uk-flex uk-flex-right" style={{ transform: "translate(20px, -20px)" }}>
        <Badge>{`${numWords} words`}</Badge>
        <Badge>{`${(percentOverlap * 100).toFixed(0)}% overlap`}</Badge>
      </div>
      <Markup
        markups={markup[1]}
        markupState={markupState}
        scrollState={scrollState}
        showMarkup={showMarkup}
      />
      <div className="uk-flex uk-flex-right">
        <Feedback summary={summary} />
      </div>
    </div>
  );
};

const Document = ({ markup, markupState, scrollState, showMarkup }) => (
  <>
    <div>
      <div
        className="uk-card uk-card-default uk-card-body"
        style={{ height: "60vh", width: "auto", overflow: "auto", padding: "20px" }}
      >
        <Markup
          markups={markup}
          markupState={markupState}
          scrollState={scrollState}
          showMarkup={showMarkup}
        />
      </div>
    </div>
  </>
);

const SummaryTabView = ({ title, showOverlap, summaries, markups, documentLength }) => {
  const { summarizers } = useContext(SummarizersContext);
  const markupState = useState(null);
  const scrollState = useMarkupScroll();
  const resetScroll = scrollState[2];
  const [summaryIndex, setSummaryIndex] = useReducer((_, index) => {
    resetScroll();
    return index;
  }, 0);

  if (!markups.length) return <div>some error occured</div>;
  return (
    <div className="uk-flex">
      <div style={{ flexBasis: "60%" }}>
        <Header text={title || "Document"} fontSize="16pt">
          <span style={{ fontSize: "12pt" }}>{documentLength} words</span>
        </Header>
        <Document
          title={title}
          markup={markups[summaryIndex][0]}
          markupState={markupState}
          scrollState={scrollState}
          showMarkup={showOverlap}
        />
      </div>
      <div style={{ minWidth: "20px" }} />
      <div style={{ flexBasis: "40%" }}>
        <Header>
          <ul className="uk-tab dark-tab uk-margin" data-uk-tab="connect: #summary-display;">
            {summaries.map(({ name }, index) => (
              <li key={name}>
                <a
                  className=""
                  style={{ color: "blue", fontSize: "1em" }}
                  href="/#"
                  onClick={() => setSummaryIndex(index)}
                >
                  {summarizers[name].name}
                </a>
              </li>
            ))}
          </ul>
        </Header>
        <div
          style={{ height: "auto", overflow: "auto" }}
          className="uk-card uk-card-default uk-card-body"
        >
          <ul id="summary-display" className="uk-switcher">
            {markups.map((markup, index) => (
              <li key={index}>
                <Summary
                  markup={markup}
                  summary={summaries[index]}
                  showMarkup={showOverlap}
                  markupState={markupState}
                  scrollState={scrollState}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const buildGrids = (list) => {
  const grids = [];
  let grid = null;
  for (let i = 0; i < list.length; i++) {
    if (i % 3 === 0) {
      if (grid) grids.push(grid);
      grid = [];
    }
    grid.push(list[i]);
  }
  grids.push(grid);
  return grids;
};

const SummaryCompareView = ({ summaries, markups, showOverlap }) => {
  const { summarizers } = useContext(SummarizersContext);
  const grids = buildGrids(
    markups.map((markup, index) => [markup, summarizers[summaries[index].name].name])
  );

  return (
    <>
      {grids.map((grid, gridIndex) => (
        <div key={gridIndex} className="uk-margin uk-grid uk-child-width-expand@s">
          {grid.map(([markup, summarizer], markupIndex) => (
            <div key={markupIndex}>
              <Header text={summarizer} fontSize="16pt" />
              <div
                style={{ maxHeight: "500px", overflow: "auto" }}
                className="uk-card uk-card-default uk-card-body"
              >
                <Markup markups={markup} showMarkup={showOverlap} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

const Icon = ({ OpenIcon, CloseIcon, show, toggle, descriptionOpen, descriptionClose }) =>
  show ? (
    <OpenIcon
      style={{ minWidth: "30px" }}
      onClick={toggle}
      data-uk-tooltip={`title: ${descriptionOpen}; pos: left`}
    />
  ) : (
    <CloseIcon
      onClick={toggle}
      style={{ minWidth: "30px" }}
      data-uk-tooltip={`title: ${descriptionClose}; pos: left`}
    />
  );

const ToggleView = ({ showTab, toggleShowTab }) => (
  <CSSTransition in={showTab} timeout={300} classNames="summarizer-toggle-view">
    <Bars
      style={{ minWidth: "30px" }}
      onClick={toggleShowTab}
      data-uk-tooltip={`title: ${showTab ? "Compare View" : "Reset View"}; pos: left`}
    />
  </CSSTransition>
);

const ToggleOverlap = ({ show, toggle }) => (
  <Icon
    OpenIcon={EyeOpen}
    CloseIcon={EyeClosed}
    show={show}
    toggle={toggle}
    descriptionOpen="Show Agreement"
    descriptionClose="Hide Agreement"
  />
);

const SummaryView = ({ title, summaries, documentLength }) => {
  const [showTab, toggleShowTab] = useReducer((e) => !e, true);
  const [showOverlap, toggleShowOverlap] = useReducer((e) => !e, false);
  const sums = useMemo(() => summaries.map(({ summaryText }) => summaryText), [summaries]);
  const originals = useMemo(() => summaries.map(({ originalText }) => originalText), [summaries]);
  const pairwiseMarkups = usePairwiseMarkups(originals, sums);
  const summaryMarkups = useMarkups(sums);
  const scrollRef = useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollRef.current)
        scrollRef.current.scrollIntoView({ block: "start", behavior: "smooth", alignToTop: true });
    }, 20);
    return () => clearTimeout(timeout);
  }, [summaries]);

  return (
    <div ref={scrollRef} style={{ scrollMarginTop: "100px" }}>
      <div className="uk-flex">
        <div>
          {showTab ? (
            <SummaryTabView
              documentLength={documentLength}
              showOverlap={showOverlap}
              summaries={summaries}
              title={title}
              markups={pairwiseMarkups}
            />
          ) : (
            <SummaryCompareView
              showOverlap={showOverlap}
              summaries={summaries}
              markups={summaryMarkups}
            />
          )}
        </div>
        <div
          className="icon-margin uk-flex uk-flex-column"
          style={{ marginLeft: "10px", minWidth: "30px" }}
        >
          <ToggleView showTab={showTab} toggleShowTab={toggleShowTab} />
          <ToggleOverlap show={!showOverlap} toggle={toggleShowOverlap} />
        </div>
      </div>
    </div>
  );
};

const paragraphSize = 3;
const computeParagraphs = (text) => {
  const paragraphs = [];
  for (let index = 0; index < text.length; index += paragraphSize) {
    const paragraph = text.slice(index, index + paragraphSize);
    paragraphs.push(paragraph.join(" "));
  }
  return paragraphs.join("\n\n");
};

const Summarize = () => {
  const [results, setResults] = useState(null);
  const [title, setTitle] = useState(null);
  const [computing, setComputing] = useState(null);
  const [documentLength, setDocumentLength] = useState(0);
  const { summarizers, loading, reload } = useContext(SummarizersContext);

  const summarize = async (rawText, models, summaryLength) => {
    const requestText = rawText.trim();
    const ratio = parseInt(summaryLength, 10) / 100;

    if (!models.length) {
      displayMessage("No summarizer selected");
      return;
    }
    if (!requestText) {
      displayMessage("Please enter some text.");
      return;
    }
    setComputing(true);
    try {
      const response = await summarizeRequest(requestText, models, ratio);
      const { summaries, original, url } = response;
      if (Object.values(summaries).every((summarySentences) => !summarySentences.length)) {
        throw new Error("No summaries could be generated. The input is probably too short.");
      }
      const originalText = computeParagraphs(original.text);
      const newSummaries = Object.entries(summaries).map(([name, summarySentences]) => {
        const summaryText = computeParagraphs(summarySentences);
        return {
          name,
          originalText,
          summaryText,
          url,
        };
      });
      newSummaries.sort((a, b) => a.name > b.name);
      setResults(newSummaries);
      setTitle(original.title);
      setDocumentLength(computeNumWords(originalText));
    } catch (err) {
      displayError(err);
    } finally {
      setComputing(false);
    }
  };

  if (loading) return <CenterLoading />;
  if (!summarizers) return <Button onClick={reload}>Retry</Button>;
  return (
    <>
      <InputDocument summarize={summarize} isComputing={computing} />
      {results && (
        <div style={{marginTop: "40px"}}>
          <SummaryView documentLength={documentLength} summaries={results} title={title} />
        </div>
      )}
    </>
  );
};

export { Summarize };
