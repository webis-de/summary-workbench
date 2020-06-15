import React, { useRef, useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Container from "react-bootstrap/Container";
import FormControl from "react-bootstrap/FormControl";
import Spinner from "react-bootstrap/Spinner";
import { FaArrowAltCircleDown } from "react-icons/fa";

import { summarizeRequest, summarizers, summarizeKinds } from "../common/api";
import { markup } from "../common/fragcolors";
import { Markup } from "./Markup";

const RadioButton = ({ radioKey, activeKey, readable, setActiveKey }) => {
  const isActive = radioKey === activeKey;
  return (
    <Button
      variant={isActive ? "primary" : "secondary"}
      size="lg"
      onClick={() => !isActive && setActiveKey(radioKey)}
    >
      {readable}
    </Button>
  );
};

const RadioButtons = ({ className, buttonList, onChange }) => {
  const [activeKey, setActiveKey] = useState(buttonList[0][0])
  useEffect(() => onChange(() => activeKey), [onChange, activeKey]);
  return (
    <ButtonGroup className={className}>
      {buttonList.map(([radioKey, readable]) => (
        <RadioButton
          key={radioKey}
          activeKey={activeKey}
          radioKey={radioKey}
          readable={readable}
          setActiveKey={setActiveKey}
        />
      ))}
    </ButtonGroup>
  );
};

const ComputeButton = ({isComputing, onClick}) =>
  isComputing ? (
    <Spinner className="m-2" animation="border" size="lg" />
  ) : (
    <Button
      className="d-flex justify-content-center align-items-center"
      variant="success"
      size="lg"
      onClick={onClick}
    >
      <FaArrowAltCircleDown className="mr-2" />
      Generate
    </Button>
  );

const MarkupDisplayer = ({ className, markupedText, name }) =>
  markupedText !== null && (
    <div className="mb-3 p-3 border">
      <h6 className="d-flex flex-row justify-content-center">{name}</h6>
      <Markup markupedText={markupedText} />
    </div>
  );

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
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("failure with Request");
        }
      })
      .then(({ summary, original_text }) => {
        if (summary === "") {
          alert(
            "No text could be generated. Maybe the input is not valid for the choosen summarizer."
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
