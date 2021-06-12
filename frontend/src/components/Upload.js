import React, { useContext, useState } from "react";

import { evaluateRequest } from "../api";
import { MetricsContext } from "../contexts/MetricsContext";
import { displayMessage } from "../utils/message";
import { Button } from "./utils/Button";
import { ChooseFile, sameLength, useFile } from "./utils/ChooseFile";
import { InfoText } from "./utils/InfoText";
import { Loading } from "./utils/Loading";

const getChosenMetrics = (settings) =>
  Object.entries(settings)
    .filter((e) => e[1])
    .map((e) => e[0]);

const getMessages = (filesAreInput, linesAreSame, metricIsChoosen) => [
  [
    !filesAreInput,
    "Both files must contain the same number of non-empty lines. Each line is interpreted as a sentence.",
    false,
  ],
  [!linesAreSame, "The files are not valid because they have different number of lines.", true],
  [!metricIsChoosen, "Select at least one metric.", true],
];

const Upload = ({ setCalculation }) => {
  const [hypFileName, setHypFile, hypotheses] = useFile(null);
  const [refFileName, setRefFile, references] = useFile(null);

  const { settings } = useContext(MetricsContext);

  const [isComputing, setIsComputing] = useState(false);

  const filesAreInput = hypotheses && references;
  const linesAreSame = sameLength([hypotheses, references]);
  const metricIsChoosen = Object.values(settings).some((e) => e);

  const compute = async () => {
    setIsComputing(true);
    const id = `${hypFileName}-${refFileName}`;
    const chosenMetrics = getChosenMetrics(settings);
    try {
      const { scores } = await evaluateRequest(chosenMetrics, hypotheses, references);
      setCalculation({ id, scores, hypotheses, references });
    } catch (err) {
      if (err instanceof TypeError) {
        displayMessage("Server not available");
      } else {
        displayMessage("Internal server error");
      }
    }
    setIsComputing(false);
  };

  return (
    <>
      <InfoText messages={getMessages(filesAreInput, linesAreSame, metricIsChoosen)} />
      <div
        className="uk-margin uk-grid uk-grid-small uk-child-width-1-2@s"
        style={{ gridRowGap: "10px" }}
      >
        <ChooseFile
          kind="reference texts"
          fileName={refFileName}
          setFile={setRefFile}
          lines={references}
          linesAreSame={linesAreSame}
          name="RefFile"
        />
        <ChooseFile
          kind="generated texts"
          fileName={hypFileName}
          setFile={setHypFile}
          lines={hypotheses}
          linesAreSame={linesAreSame}
          name="HypFile"
        />
      </div>
      <div className="uk-flex uk-flex-left">
        {isComputing ? (
          <Loading />
        ) : (
          <Button
            variant="primary"
            disabled={!filesAreInput || !linesAreSame || !metricIsChoosen}
            onClick={compute}
          >
            Evaluate
          </Button>
        )}
      </div>
    </>
  );
};

export { Upload };
