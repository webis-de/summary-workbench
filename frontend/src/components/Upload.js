import React, { useContext, useEffect, useState } from "react";
import { FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

import { evaluateRequest } from "../api";
import { SettingsContext } from "../contexts/SettingsContext";
import { markup } from "../utils/fragcolors";
import { displayMessage } from "../utils/message";
import { readFile } from "../utils/readFile";
import { Button } from "./utils/Button";
import { ChooseFile } from "./utils/ChooseFile";
import { Loading } from "./utils/Loading";

const numberOfLines = (string) => {
  let numLines = 1;
  const { length } = string;
  for (let i = 0; i < length; i++) {
    if (string[i] === "\n") {
      numLines++;
    }
  }
  return numLines;
};

const useFile = (file) => {
  const [numLines, setNumLines] = useState(null);
  useEffect(() => {
    if (file) {
      readFile(file)
        .then((text) => text.trim())
        .then((text) => setNumLines(numberOfLines(text)))
        .catch((err) => displayMessage(err.message));
    }
  }, [file]);

  return [numLines];
};

const Upload = ({ setCalculateResult }) => {
  const [hypFile, setHypFile] = useState(null);
  const [refFile, setRefFile] = useState(null);
  const [refFileLines] = useFile(refFile);
  const [hypFileLines] = useFile(hypFile);
  const [linesAreSame, setLinesAreSame] = useState(null);

  useEffect(() => {
    if (refFileLines !== null && hypFileLines !== null) {
      setLinesAreSame(refFileLines === hypFileLines);
    } else {
      setLinesAreSame(null);
    }
  }, [refFileLines, hypFileLines]);

  const { settings } = useContext(SettingsContext);

  const [isComputing, setIsComputing] = useState(false);

  const getChosenMetrics = () =>
    Object.entries(settings)
      .filter(([, { isSet }]) => isSet)
      .map(([metric]) => metric);

  const getComparisons = (hypdata, refdata) => {
    const hyplines = hypdata.split("\n");
    const reflines = refdata.split("\n");
    return hyplines.map((hypline, i) => markup(hypline, reflines[i]));
  };

  const compute = () => {
    if (hypFile !== null && refFile !== null) {
      setIsComputing(true);

      Promise.all([
        readFile(hypFile).then((text) => text.trim()),
        readFile(refFile).then((text) => text.trim()),
      ]).then(([hypdata, refdata]) => {
        const hyplines = hypdata.split("\n");
        const reflines = refdata.split("\n");
        const name = `${hypFile.name}-${refFile.name}`;
        const chosenMetrics = getChosenMetrics();

        if (hyplines.length === reflines.length) {
          if (chosenMetrics.length > 0) {
            evaluateRequest(chosenMetrics, hyplines, reflines)
              .then((scores) => {
                const comparisons = getComparisons(hypdata, refdata);
                setCalculateResult({ name, scores, comparisons });
              })
              .catch((err) => {
                if (err instanceof TypeError) {
                  displayMessage("Server not available");
                } else {
                  displayMessage("Internal server error");
                }
              })
              .finally(() => setIsComputing(false));
          } else {
            const comparisons = getComparisons(hypdata, refdata);
            setCalculateResult({ name, scores: { metrics: {} }, comparisons });
            setIsComputing(false);
          }
        } else {
          setIsComputing(false);
          alert("Files must have equal number of lines");
        }
      });
    } else {
      alert("Upload files");
    }
  };

  return (
    <>
      {refFile === null && hypFile === null ? (
        <p className="uk-text-primary" style={{ marginTop: "-25px" }}>
          <FaInfoCircle /> Both files must contain the same number of non-empty lines
        </p>
      ) : (
        linesAreSame === false && (
          <p className="uk-text-danger" style={{ marginTop: "-25px" }}>
            <FaExclamationCircle /> Both files must contain the same number of non-empty lines
          </p>
        )
      )}
      <div
        className="uk-margin uk-grid uk-grid-small uk-child-width-1-2@s"
        style={{ gridRowGap: "10px" }}
      >
        <ChooseFile
          kind="reference texts"
          file={refFile}
          setFile={setRefFile}
          lines={refFileLines}
          linesAreSame={linesAreSame}
          name="RefFile"
        />
        <ChooseFile
          kind="generated texts"
          file={hypFile}
          setFile={setHypFile}
          lines={hypFileLines}
          linesAreSame={linesAreSame}
          name="HypFile"
        />
      </div>
      <div className="uk-flex uk-flex-left">
        <Loading isLoading={isComputing}>
          <Button variant="primary" disabled={!linesAreSame} onClick={() => compute(false)}>
            Evaluate
          </Button>
          <div />
        </Loading>
      </div>
    </>
  );
};

export { Upload };
