import React, { useContext, useState } from "react";
import { FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

import { evaluateRequest } from "../api";
import { SettingsContext } from "../contexts/SettingsContext";
import { markup } from "../utils/fragcolors";
import { displayMessage } from "../utils/message";
import { Button } from "./utils/Button";
import { ChooseFile, sameLength, useFile } from "./utils/ChooseFile";
import { Loading } from "./utils/Loading";

const getChosenMetrics = (settings) =>
  Object.entries(settings)
    .filter(([, { isSet }]) => isSet)
    .map(([metric]) => metric);

const Upload = ({ setCalculateResult }) => {
  const [hypFileName, setHypFile, hypLines] = useFile(null);
  const [refFileName, setRefFile, refLines] = useFile(null);
  const linesAreSame = sameLength([hypLines, refLines]);

  const { settings } = useContext(SettingsContext);

  const [isComputing, setIsComputing] = useState(false);

  const getComparisons = () => hypLines.map((hypLine, i) => markup(hypLine, refLines[i]));

  const compute = async () => {
    if (!hypLines || !refLines) {
      displayMessage("No files uploaded yet");
      return;
    }

    if (hypLines.length !== refLines.length) {
      displayMessage("Files must have equal number of lines");
      return;
    }

    setIsComputing(true);
    const name = `${hypFileName}-${refFileName}`;
    const comparisons = getComparisons(hypLines, refLines);
    const chosenMetrics = getChosenMetrics(settings);
    const result = { name, comparisons };

    if (chosenMetrics.length === 0) {
      setCalculateResult({ scores: { metrics: {} }, ...result });
    } else {
      try {
        const scores = await evaluateRequest(chosenMetrics, hypLines, refLines);
        setCalculateResult({ scores, ...result });
      } catch (err) {
        if (err instanceof TypeError) {
          displayMessage("Server not available");
        } else {
          displayMessage("Internal server error");
        }
      }
      setIsComputing(false);
    }
  };

  return (
    <>
      {refFileName === null && hypFileName === null ? (
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
          fileName={refFileName}
          setFile={setRefFile}
          lines={refLines}
          linesAreSame={linesAreSame}
          name="RefFile"
        />
        <ChooseFile
          kind="generated texts"
          fileName={hypFileName}
          setFile={setHypFile}
          lines={hypLines}
          linesAreSame={linesAreSame}
          name="HypFile"
        />
      </div>
      <div className="uk-flex uk-flex-left">
        {isComputing ? (
          <Loading />
        ) : (
          <Button variant="primary" disabled={!linesAreSame} onClick={compute}>
            Evaluate
          </Button>
        )}
      </div>
    </>
  );
};

export { Upload };
