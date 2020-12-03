import React, { useContext, useEffect, useState } from "react";
import { FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

import { evaluateRequest } from "../api";
import { SettingsContext } from "../contexts/SettingsContext";
import { markup } from "../utils/fragcolors";
import { readFile } from "../utils/readFile";
import { Button } from "./utils/Button";
import { ChooseFile } from "./utils/ChooseFile";
import { Loading } from "./utils/Loading";

const numberOfLines = (string) => {
  let numLines = 1;
  const length = string.length;
  for (let i = 0; i < length; i++) {
    if (string[i] === "\n") {
      numLines++;
    }
  }
  return numLines;
};

const Upload = ({ className, setCalculateResult }) => {
  const [hypFile, setHypFile] = useState(null);
  const [refFile, setRefFile] = useState(null);
  const [refFileLines, setRefFileLines] = useState(null);
  const [hypFileLines, setHypFileLines] = useState(null);
  const [linesAreSame, setLinesAreSame] = useState(null);

  useEffect(() => {
    if (hypFile !== null) {
      readFile(hypFile).then((text) => setHypFileLines(numberOfLines(text)));
    }
  }, [hypFile]);
  useEffect(() => {
    if (refFile !== null) {
      readFile(refFile).then((text) => setRefFileLines(numberOfLines(text)));
    }
  }, [refFile]);
  useEffect(
    () =>
      setLinesAreSame(
        refFileLines !== null && hypFileLines !== null ? refFileLines === hypFileLines : null
      ),
    [refFileLines, hypFileLines]
  );

  const { settings } = useContext(SettingsContext);

  const [isComputing, setIsComputing] = useState(false);

  const getChosenMetrics = () =>
    Object.entries(settings)
      .filter(([metric, { is_set }]) => is_set)
      .map(([metric, metricInfo]) => metric);

  const getComparisons = (hypdata, refdata) => {
    const hyplines = hypdata.split("\n");
    const reflines = refdata.split("\n");
    return hyplines.map((hypline, i) => markup(hypline, reflines[i]));
  };

  const compute = (summ_eval = false) => {
    if (hypFile !== null && refFile !== null) {
      setIsComputing(true);

      Promise.all([
        readFile(hypFile).then((text) => text.trim()),
        readFile(refFile).then((text) => text.trim()),
      ]).then(([hypdata, refdata]) => {
        const hyplines = hypdata.split("\n");
        const reflines = refdata.split("\n");
        const name = hypFile.name + "-" + refFile.name;
        const chosenMetrics = getChosenMetrics();

        if (hyplines.length === reflines.length) {
          if (chosenMetrics.length > 0) {
            evaluateRequest(chosenMetrics, hyplines, reflines, summ_eval)
              .then((scores) => {
                const comparisons = getComparisons(hypdata, refdata);
                setCalculateResult({ name, scores, comparisons });
              })
              .catch((error) => {
                if (error instanceof TypeError) {
                  alert("Server not available");
                } else {
                  alert("Internal server error");
                }
              })
              .finally(() => setIsComputing(false));
          } else {
            const comparisons = getComparisons(hypdata, refdata, summ_eval);
            setCalculateResult({ name, scores: {metrics: {}}, comparisons });
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

  return <>
      { refFile === null && hypFile === null ? <p className="uk-text-primary" style={{ marginTop: "-25px" }}>
        <FaInfoCircle /> Both files must contain the same number of non-empty lines
      </p> : linesAreSame === false && <p className="uk-text-danger" style={{ marginTop: "-25px" }}>
          <FaExclamationCircle /> Both files must contain the same number of non-empty lines
        </p>
      }
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
            {"Evaluate"}
          </Button>
          <div />
          {/* <Button variant="primary" onClick={() => compute(true)}>
            {"Evaluate with SummEval"}
          </Button> */}
        </Loading>
      </div>
    </>
};

export { Upload };
