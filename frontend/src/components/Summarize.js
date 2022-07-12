import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { CSSTransition } from "react-transition-group";
import { useAsyncFn } from "react-use";

import { feedbackRequest, pdfExtractRequest, summarizeRequest } from "../api";
import { SettingsContext } from "../contexts/SettingsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { useMarkups, usePairwiseMarkups } from "../hooks/markup";
import { extractArgumentErrors, getChosen } from "../utils/common";
import { collectPluginErrors, mapErrorsToName } from "../utils/data";
import { Settings } from "./Settings";
import { Badge } from "./utils/Badge";
import { Button, CopyToClipboardButton, LoadingButton } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { ChooseFile, FileInput, useFile, useFileInput } from "./utils/ChooseFile";
import { ErrorBox, Errors } from "./utils/Error";
import { Checkbox, Textarea } from "./utils/Form";
import { Bars, Eye, ThumbsDown, ThumbsUp } from "./utils/Icons";
import { SpaceGap } from "./utils/Layout";
import { CenterLoading } from "./utils/Loading";
import { Markup, useMarkupScroll } from "./utils/Markup";
import { Range } from "./utils/Range";
import { PillLink, Tab, TabContent, TabHead, TabPanel, Tabs } from "./utils/Tabs";
import { HeadingBig, HeadingMedium, HeadingSemiBig, Hint } from "./utils/Text";
import { Tooltip } from "./utils/Tooltip";

const Feedback = ({ summary }) => {
  const { name, summaryText, originalText, url } = summary;
  const [state, submit] = useAsyncFn(
    (feedback) => feedbackRequest(name, summaryText, originalText, url, feedback).then(() => true),
    [name, summaryText, originalText, url]
  );

  if (state.value) return <HeadingSemiBig>Thanks for the Feedback!</HeadingSemiBig>;
  return (
    <div className="flex flex-col">
      <div className="flex gap-4">
        <HeadingSemiBig>Good Summary?</HeadingSemiBig>
        <div className="flex gap-2 items-center">
          <ThumbsUp className="w-5 h-5" onClick={() => submit("good")} />
          <ThumbsDown className="w-5 h-5" onClick={() => submit("bad")} />
        </div>
      </div>
      {state.error && (
        <Hint type="danger" small>
          An Error occured
        </Hint>
      )}
    </div>
  );
};

const sampleText = `Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist. Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine, which can be considered a model of a general-purpose computer. Turing is widely considered to be the father of theoretical computer science and artificial intelligence. Despite these accomplishments, he was never fully recognised in his home country, if only because much of his work was covered by the Official Secrets Act.
During the Second World War, Turing worked for the Government Code and Cypher School (GC&CS) at Bletchley Park, Britain's codebreaking centre that produced Ultra intelligence. For a time he led Hut 8, the section that was responsible for German naval cryptanalysis. Here, he devised a number of techniques for speeding the breaking of German ciphers, including improvements to the pre-war Polish bombe method, an electromechanical machine that could find settings for the Enigma machine.
Turing played a crucial role in cracking intercepted coded messages that enabled the Allies to defeat the Nazis in many crucial engagements, including the Battle of the Atlantic. Due to the problems of counterfactual history, it is hard to estimate the precise effect Ultra intelligence had on the war, but Professor Jack Copeland has estimated that this work shortened the war in Europe by more than two years and saved over 14 million lives.
After the war, Turing worked at the National Physical Laboratory, where he designed the Automatic Computing Engine. The Automatic Computing Engine was one of the first designs for a stored-program computer. In 1948, Turing joined Max Newman's Computing Machine Laboratory, at the Victoria University of Manchester, where he helped develop the Manchester computers and became interested in mathematical biology. He wrote a paper on the chemical basis of morphogenesis and predicted oscillating chemical reactions such as the Belousov–Zhabotinsky reaction, first observed in the 1960s.
Turing was prosecuted in 1952 for homosexual acts; the Labouchere Amendment of 1885 had mandated that "gross indecency" was a criminal offence in the UK. He accepted chemical castration treatment, with DES, as an alternative to prison. Turing died in 1954, 16 days before his 42nd birthday, from cyanide poisoning. An inquest determined his death as a suicide, but it has been noted that the known evidence is also consistent with accidental poisoning.
In 2009, following an Internet campaign, British Prime Minister Gordon Brown made an official public apology on behalf of the British government for "the appalling way he was treated". Queen Elizabeth II granted Turing a posthumous pardon in 2013. The "Alan Turing law" is now an informal term for a 2017 law in the United Kingdom that retroactively pardoned men cautioned or convicted under historical legislation that outlawed homosexual acts.`;

const pdfJsonToText = ({ title, sections, selected }) =>
  [
    title,
    ...sections
      .filter((_, i) => selected[i])
      .map(({ title: heading, texts }) => `${heading}\n${texts.join("\n")}`),
  ].join("\n\n");

const PdfUpload = ({ setPdfExtract }) => {
  const [{ loading, error }, setFile] = useAsyncFn(async (file) => {
    if (file) {
      if (file.type !== "application/pdf") throw new TypeError("invalid file type");
      const { title, abstract, sections } = await pdfExtractRequest(file);
      if (!title) setPdfExtract(null);
      const newSections = sections.map(({ section, secNum, texts }) => ({
        title: `${secNum !== null ? `${secNum} ` : ""}${section}`,
        texts,
      }));
      newSections.unshift({ title: "Abstract", texts: [abstract] });
      setPdfExtract({ title, sections: newSections });
    }
  });
  const { fileInputRef, dragged, onDrop, onClick } = useFileInput(setFile);
  return (
    <div className="flex flex-col gap-3">
      <FileInput fileInputRef={fileInputRef} setFile={setFile} />
      <div className="flex justify-between items-center w-full">
        {loading ? (
          <LoadingButton appearance="soft" small text="Extracting" />
        ) : (
          <div
            className={` ${
              dragged ? "outline-dashed outline-2 outline-offset-4 outline-black rounded-lg" : ""
            }`}
            onDrop={onDrop}
          >
            <Button onClick={onClick} small appearance="soft">
              Upload PDF file
            </Button>
          </div>
        )}
        <Button
          variant="primary"
          appearance="link"
          target="_blank"
          href="https://aclanthology.org/D19-1410.pdf"
          download
        >
          Link to sample PDF
        </Button>
      </div>
      {!loading && error && (
        <Hint type="danger" small>
          {error.message}
        </Hint>
      )}
    </div>
  );
};

const TextInput = ({ setCallback, setErrors }) => {
  const [documentText, setDocumentText] = useState("");

  useEffect(() => {
    setCallback(() => ({ data: documentText }));
    if (!documentText) setErrors(["Input text to summarize"]);
    else setErrors(null);
  }, [setCallback, setErrors, documentText]);

  return (
    <div className="relative h-full">
      <div className="absolute -top-3 right-5">
        <Button
          variant="primary"
          appearance="soft"
          small
          onClick={() => setDocumentText(sampleText)}
        >
          Sample Text
        </Button>
      </div>
      <Textarea
        value={documentText}
        onChange={(e) => setDocumentText(e.currentTarget.value)}
        placeholder="Enter a URL or the text to be summarized."
      />
    </div>
  );
};

const PdfSection = ({ index, selected, heading, texts, registerRef }) => {
  const scrollRef = useRef(null);
  registerRef(index, scrollRef);
  return (
    <div className={selected ? "" : "opacity-25"}>
      <div ref={scrollRef}>
        <HeadingMedium>{heading}</HeadingMedium>
      </div>
      {texts.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
    </div>
  );
};

const PdfDisplay = ({ title, sections, selected, registerRef }) => (
  <div className="flex flex-col gap-4 divide-y-2 divide-gray-700">
    <HeadingSemiBig>{title}</HeadingSemiBig>
    {sections.map(({ title: heading, texts }, j) => (
      <PdfSection
        key={j}
        index={j}
        selected={selected[j]}
        heading={heading}
        texts={texts}
        registerRef={registerRef}
      />
    ))}
  </div>
);

const PdfInput = ({ setCallback, setErrors }) => {
  const [pdfExtract, setPdfExtract] = useReducer((_, newState) => {
    if (!newState) return null;
    if (newState.selected) return newState;
    return { ...newState, selected: newState.sections.map(() => true) };
  }, null);
  const toggleSelected = (i) =>
    setPdfExtract({
      ...pdfExtract,
      selected: pdfExtract.selected.map((s, j) => (j === i ? !s : s)),
    });

  useEffect(() => {
    setCallback(() => ({data: pdfExtract ? pdfJsonToText(pdfExtract) : ""}));
    if (!pdfExtract) setErrors(["Upload a PDF file"]);
    else if (pdfExtract.selected.every((v) => !v)) setErrors(["Select some section to summarize"]);
    else setErrors(null);
  }, [setCallback, setErrors, pdfExtract]);

  const scrollRefs = useRef({});
  const registerRef = (index, ref) => {
    scrollRefs.current[index] = ref;
  };
  const parentRef = useRef(null);

  const allIsChecked = useMemo(
    () => pdfExtract && pdfExtract.selected.every((e) => e),
    [pdfExtract]
  );

  const toggleAll = () => {
    setPdfExtract({
      ...pdfExtract,
      selected: pdfExtract.selected.map(() => !allIsChecked),
    });
  };

  return (
    <div className="h-full flex flex-col gap-2">
      <PdfUpload setPdfExtract={setPdfExtract} />
      {pdfExtract && (
        <div className="flex overflow-hidden gap-2">
          <div className="border border-gray-500 pl-1 basis-[30%] overflow-x-hidden overflow-y-auto">
            <div className="flex flex-col items-start">
              <Checkbox checked={allIsChecked} onChange={toggleAll} bold>
                toggle all sections
              </Checkbox>
              {pdfExtract.sections.map(({ title }, i) => (
                <Checkbox
                  key={i}
                  checked={pdfExtract.selected[i]}
                  onChange={() => toggleSelected(i)}
                  onClickText={() => {
                    const target = scrollRefs.current[i].current;
                    parentRef.current.scroll({
                      left: 0,
                      top: target.offsetTop,
                      behavior: "smooth",
                    });
                  }}
                >
                  <span title={title}>{title || "<unnamed>"}</span>
                </Checkbox>
              ))}
            </div>
          </div>
          <div
            ref={parentRef}
            className="relative border border-gray-500 basis-[70%] overflow-y-auto"
          >
            <PdfDisplay {...pdfExtract} registerRef={registerRef} />
          </div>
        </div>
      )}
    </div>
  );
};

const BulkInput = ({ setCallback, setErrors }) => {
  const { fileName, lines, setFile } = useFile();

  useEffect(() => {
    if (!lines) {
      setErrors(["no file given"]);
      setCallback(() => null);
      return;
    }
    const filteredLines = lines.filter((line) => line !== "");
    if (!filteredLines.length) setErrors(["all lines are empty"]);
    else setErrors(null);
    setCallback(() => ({ data: filteredLines, fileName }));
  }, [fileName, lines, setCallback, setErrors]);

  return (
    <div className="flex flex-col gap-3">
      <Hint small>
        Every non-empty line of the file is interpreted as a document that has to be summarized. The
        result is a jsonl where the {'"document"'} entry holds the document and all other keys are
        the names of the models and hold the corresponding summary.
      </Hint>
      <ChooseFile kind="summaries" fileName={fileName} setFile={setFile} lines={lines} />
    </div>
  );
};

const InputDocument = ({ summarize, state, abortController }) => {
  const { summarizers, types, toggle, setArgument } = useContext(SummarizersContext);
  const { summaryLength, setSummaryLength } = useContext(SettingsContext);
  const getTextRef = useRef(null);

  const chosenModels = useMemo(() => Object.keys(getChosen(summarizers)), [summarizers]);
  const modelIsChosen = Boolean(chosenModels.length);
  const [componentErrors, setComponentErrors] = useState(null);

  const argErrors = useMemo(
    () => extractArgumentErrors(chosenModels, summarizers),
    [chosenModels, summarizers]
  );

  const disableErrors = [];
  if (argErrors) disableErrors.push(...argErrors);
  if (componentErrors) disableErrors.push(...componentErrors);
  if (!modelIsChosen) disableErrors.push("Choose at least one metric");

  const setCallback = useCallback((cb) => {
    getTextRef.current = cb;
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="grow min-w-[400px]">
        <div>
          <Card full>
            <Tabs>
              <CardContent>
                <TabHead border>
                  <Tab>Text</Tab>
                  <Tab>Pdf</Tab>
                  <Tab>Bulk</Tab>
                </TabHead>
                <div className="h-[50vh]">
                  <TabContent>
                    <TabPanel>
                      <TextInput setCallback={setCallback} setErrors={setComponentErrors} />
                    </TabPanel>
                    <TabPanel>
                      <PdfInput setCallback={setCallback} setErrors={setComponentErrors} />
                    </TabPanel>
                    <TabPanel>
                      <BulkInput setCallback={setCallback} setErrors={setComponentErrors} />
                    </TabPanel>
                  </TabContent>
                </div>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <div className="lg:w-1/2 lg:max-w-[600px] min-w-[500px]">
        <Card full>
          <CardHead>
            <HeadingSemiBig>Models</HeadingSemiBig>
          </CardHead>
          <CardContent>
            <Settings
              models={summarizers}
              types={types}
              setArgument={setArgument}
              toggleSetting={toggle}
              type="Summarizers"
            />
            <div className="border p-2">
              <HeadingMedium>Summary length</HeadingMedium>
              <Hint small>Length of the summary in percent</Hint>
              <div className="px-7">
                <Range
                  defaultValue={summaryLength}
                  setValue={setSummaryLength}
                  min={15}
                  max={50}
                  step={5}
                />
              </div>
            </div>
            <div className="flex justify-between items-center gap-5">
              {state.loading ? (
                <LoadingButton text="Summarizing" />
              ) : (
                <Button
                  disabled={disableErrors.length}
                  onClick={() => summarize(getTextRef.current(), chosenModels, summaryLength)}
                >
                  Summarize
                </Button>
              )}
              {abortController && (
                <Button variant="danger" appearance="box" onClick={() => abortController.abort()}>
                  Cancel
                </Button>
              )}
            </div>
            <div className="flex flex-col">
              <Errors errors={disableErrors} type="warning" />
              {!state.loading && (
                <>
                  {state.error && (
                    <Hint type="danger" small>
                      {state.error.message}
                    </Hint>
                  )}
                  {state.value && (
                    <>
                      {state.value.errors && (
                        <ErrorBox>
                          <Errors errors={state.value.errors} />
                        </ErrorBox>
                      )}
                      {state.value.summaries && !state.value.summaries.length && (
                        <Hint type="danger" small>
                          no summaries were generated
                        </Hint>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
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

  const cleanedText = useMemo(() => summaryText.replace(/\s+/g, " "), [summaryText]);

  return (
    <div>
      <div className="flex gap-2 pb-2 -mt-2">
        <Badge>{`${numWords} words`}</Badge>
        <Badge>{`${(percentOverlap * 100).toFixed(0)}% overlap`}</Badge>
      </div>
      <div className="max-h-[60vh] overflow-auto">
        <Markup
          markups={markup[1]}
          markupState={markupState}
          scrollState={scrollState}
          showMarkup={showMarkup}
        />
      </div>
      <div className="pt-4 flex justify-between items-center gap-4 w-full">
        <Feedback summary={summary} />
        <div>
          <CopyToClipboardButton text={cleanedText} />
        </div>
      </div>
    </div>
  );
};

// <div className="grow flex items-start gap-3 max-w-full">
//   <div className="basis-[60%] min-w-0">
//     <Card full>
//       <CardHead>
//         <div className="overflow-hidden whitespace-nowrap">{title}</div>
//       </CardHead>
//       <div className="max-h-[70vh] overflow-auto bg-white p-4">
//         <Markup
//           markups={markups[summaryIndex][0]}
//           markupState={markupState}
//           scrollState={scrollState}
//           showMarkup={showOverlap}
//         />
//       </div>
//     </Card>
//   </div>
//   <div className="basis-[40%] ">
const SummaryTabView = ({ title, showOverlap, summaries, originals, sums, documentLength }) => {
  const markups = usePairwiseMarkups(originals, sums);
  const { summarizers } = useContext(SummarizersContext);
  const markupState = useState(null);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const scrollState = useMarkupScroll(summaryIndex);

  return (
    <div className="flex items-start gap-3">
      <div className="basis-[60%] min-w-0">
        <Card full>
          <CardHead>
            <h3 className="overflow-hidden overflow-ellipsis whitespace-nowrap text-bold capitalize text-slate-600 font-semibold">
              {title}
            </h3>
            <span className="font-bold">{documentLength} words</span>
          </CardHead>
          <div className="max-h-[70vh] overflow-auto bg-white p-4">
            <Markup
              markups={markups[summaryIndex][0]}
              markupState={markupState}
              scrollState={scrollState}
              showMarkup={showOverlap}
            />
          </div>
        </Card>
      </div>
      <div className="basis-[40%]">
        <Tabs onChange={(index) => setSummaryIndex(index)}>
          <Card full>
            <CardHead>
              <TabHead>
                <div className="flex flex-wrap gap-x-7">
                  {summaries.map(({ name }) => (
                    <PillLink key={name}>{summarizers[name].info.name}</PillLink>
                  ))}
                </div>
              </TabHead>
            </CardHead>
            <CardContent white>
              <TabContent>
                {markups.map((markup, index) => (
                  <TabPanel key={index}>
                    <Summary
                      markup={markup}
                      summary={summaries[index]}
                      showMarkup={showOverlap}
                      markupState={markupState}
                      scrollState={scrollState}
                    />
                  </TabPanel>
                ))}
              </TabContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

const SummaryCompareView = ({ summaries, sums, showOverlap, setOverlap }) => {
  const { summarizers } = useContext(SummarizersContext);
  const [overlapSummaries, setOverlapSummaries] = useState(null);
  const showIndexes = useMemo(() => {
    if (!overlapSummaries) return [];
    return overlapSummaries
      .map((v, i) => [i, v])
      .filter(([, v]) => v)
      .map(([i]) => i);
  }, [overlapSummaries]);
  const showSums = useMemo(() => showIndexes.map((i) => sums[i]), [showIndexes, sums]);
  const markups = useMarkups(showSums);
  const markupState = useState(null);
  const scrollState = useMarkupScroll(overlapSummaries);
  const elements = useMemo(() => {
    const newSums = sums.map((sum, index) => [[sum], summarizers[summaries[index].name].info.name]);
    showIndexes.forEach((i, j) => {
      newSums[i][0] = markups[j];
    });
    return newSums;
  }, [markups, showIndexes, summaries, summarizers, sums]);
  const lastShowOverlap = useRef(showOverlap);

  useEffect(() => {
    if (
      !overlapSummaries ||
      (lastShowOverlap.current !== showOverlap && overlapSummaries.some((v) => v) !== showOverlap)
    )
      setOverlapSummaries(Array(sums.length).fill(showOverlap));
    lastShowOverlap.current = showOverlap;
  }, [sums, showOverlap, setOverlapSummaries, overlapSummaries]);

  const toggleOverlap = (i) => {
    const newOverlap = overlapSummaries.map((v, j) => (i === j ? !v : v));
    setOverlapSummaries(newOverlap);
    setOverlap(newOverlap.some((v) => v));
  };

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {elements.map(([markup, summarizer], markupIndex) => (
        <div key={markupIndex} className="">
          <Card full>
            <CardHead tight>
              <HeadingSemiBig>{summarizer}</HeadingSemiBig>
              <Eye
                show={overlapSummaries && !overlapSummaries[markupIndex]}
                size={28}
                onClick={() => toggleOverlap(markupIndex)}
              />
            </CardHead>
            <CardContent white>
              <div className="max-h-72 overflow-auto">
                <Markup
                  markups={markup}
                  showMarkup
                  markupState={markupState}
                  scrollState={scrollState}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

const ToggleView = ({ showTab, toggleShowTab }) => (
  <Tooltip text="Change View">
    <CSSTransition in={showTab} timeout={300} classNames="summarizer-toggle-view">
      <Bars className="w-7 h-7" onClick={toggleShowTab} />
    </CSSTransition>
  </Tooltip>
);

const ToggleOverlap = ({ show, toggle }) => (
  <Tooltip text={"Show/Hide Agreement"}>
    <Eye show={show} className="w-7 h-7" onClick={toggle} />
  </Tooltip>
);

const SummaryView = ({ summaries, documentLength }) => {
  const [showTab, toggleShowTab] = useReducer((e) => !e, true);
  const [showOverlap, setOverlap] = useState(false);
  const toggleShowOverlap = () => setOverlap((e) => !e);
  const sums = useMemo(() => summaries.map(({ summaryText }) => summaryText), [summaries]);
  const originals = useMemo(() => summaries.map(({ originalText }) => originalText), [summaries]);
  const scrollRef = useRef();
  const titleText = useMemo(() => {
    const t = originals[0];
    if (t) return t.split(/[.!?]+/)[0];
    return null;
  }, [originals]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollRef.current)
        scrollRef.current.scrollIntoView({ block: "start", behavior: "smooth", alignToTop: true });
    }, 20);
    return () => clearTimeout(timeout);
  }, [summaries]);

  return (
    <div className="scroll-mt-20" ref={scrollRef}>
      <div className="flex gap-2 w-full">
        <div className="overflow-hidden">
          {showTab ? (
            <SummaryTabView
              documentLength={documentLength}
              showOverlap={showOverlap}
              summaries={summaries}
              title={titleText}
              originals={originals}
              sums={sums}
            />
          ) : (
            <SummaryCompareView
              showOverlap={showOverlap}
              setOverlap={setOverlap}
              summaries={summaries}
              sums={sums}
            />
          )}
        </div>
        <div className="flex flex-col">
          <ToggleView showTab={showTab} toggleShowTab={toggleShowTab} />
          <ToggleOverlap show={!showOverlap} toggle={toggleShowOverlap} />
        </div>
      </div>
    </div>
  );
};

const BulkView = ({ summaries, fileName }) => {
  const sampleFileUrl = useMemo(
    () =>
      window.URL.createObjectURL(new Blob([summaries.map(JSON.stringify).join("\n")]), {
        type: "text/plain",
      }),
    [summaries]
  );

  return (
    <Card>
      <CardContent>
        <div className="flex justify-center items-center w-full">
          <Button
            variant="success"
            appearance="fill"
            href={sampleFileUrl}
            download={`${fileName}-summaries.jsonl`}
          >
            Download Result as jsonl
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const paragraphSize = 1;
const computeParagraphs = (text) => {
  const paragraphs = [];
  for (let index = 0; index < text.length; index += paragraphSize) {
    const paragraph = text.slice(index, index + paragraphSize);
    paragraphs.push(paragraph.join(" "));
  }
  return paragraphs.join("\n\n");
};

const Summarize = () => {
  const { summarizers, loading, retry } = useContext(SummarizersContext);

  const [abortController, setAbortController] = useState(null);

  useEffect(
    () => () => {
      if (abortController) abortController.abort();
    },
    [abortController]
  );

  const [state, doFetch] = useAsyncFn(
    async ({ data, fileName }, models, summaryLength) => {
      const modelsWithArguments = Object.fromEntries(
        models.map((model) => [model, summarizers[model].arguments])
      );
      const ratio = parseInt(summaryLength, 10) / 100;
      const controller = new AbortController();
      setAbortController(controller);
      const response = await summarizeRequest(data, modelsWithArguments, ratio, controller).finally(() => setAbortController(null));
      if (controller.signal.aborted) return undefined;
      if (response.errors) return response;
      if (Array.isArray(response.data)) {
        let combinedData = [];
        let combinedErrors = [];
        response.data.forEach(({ summaries, document }) => {
          const { data: currData, errors } = collectPluginErrors(
            summaries,
            (name, { summary }) => (summary ? { name, summary } : undefined),
            (elements) => ({
              document,
              summaries: Object.fromEntries(
                elements.map(({ name, summary }) => [summarizers[name].info.name || name, summary])
              ),
            })
          );
          if (currData) combinedData.push(currData);
          if (errors) combinedErrors.push(...errors);
        });
        if (!combinedData.length) combinedData = undefined;
        if (!combinedErrors.length) combinedErrors = undefined;
        else combinedErrors = mapErrorsToName(combinedErrors, summarizers);
        return {
          data: { summaries: combinedData, fileName: fileName.split(".")[0] },
          errors: combinedErrors,
          hasResults: combinedData !== undefined,
          type: "bulk",
        };
      }
      const { summaries, original, url } = response.data;
      const originalText = computeParagraphs(original.text);
      const collected = collectPluginErrors(
        summaries,
        (name, { summary }) =>
          summary
            ? { name, originalText, summaryText: computeParagraphs(summary), url }
            : undefined,
        (elements) => ({
          summaries: elements,
          title: original.title,
          documentLength: computeNumWords(originalText),
        })
      );
      if (collected.errors && collected.errors.length)
        collected.errors = mapErrorsToName(collected.errors, summarizers);
      collected.type = "single";
      collected.hasResults = collected.data.summaries !== undefined;
      return collected;
    },
    [summarizers]
  );

  if (loading) return <CenterLoading />;
  if (!summarizers) return <Button onClick={retry}>Retry</Button>;

  let result = null;
  const { value } = state;
  if (!state.loading && value && value.hasResults) {
    if (value.type === "single") result = <SummaryView {...value.data} />;
    else if (value.type === "bulk") result = <BulkView {...value.data} />;
    else result = <Hint type="danger">data has unknown type {`'${value.type}'`}</Hint>;
  }

  return (
    <SpaceGap big>
      <div>
        <HeadingBig>Summarize Documents</HeadingBig>
        <Hint>
          You can select multiple models and customize the desired summary length. Longer documents
          are split into chunks for abstractive summarizers and the individual summaries are
          concatenated as the final summary.{" "}
        </Hint>
      </div>
      <InputDocument summarize={doFetch} state={state} abortController={abortController} />
      {result}
    </SpaceGap>
  );
};

export { Summarize };
