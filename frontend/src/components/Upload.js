import React, { useContext, useState } from "react";

import { evaluateRequest } from "../api";
import { MetricsContext } from "../contexts/MetricsContext";
import { displayError } from "../utils/message";
import { Button } from "./utils/Button";
import { ChooseFile, sameLength, useFile } from "./utils/ChooseFile";
import { FlexResponsive } from "./utils/Layout";
import { Loading } from "./utils/Loading";
import { Hint, Label } from "./utils/Text";

const getChosenMetrics = (settings) =>
  Object.entries(settings)
    .filter((e) => e[1])
    .map((e) => e[0]);

const getMessages = (filesAreInput, linesAreSame, metricIsChoosen) => [
  [
    !filesAreInput,
    "Both files must contain the same number of non-empty lines. Each line is interpreted as a sentence.",
    "info",
  ],
  [
    !linesAreSame,
    "The files are not valid because they have different number of lines.",
    "warning",
  ],
  [!metricIsChoosen, "Select at least one metric.", "warning"],
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
      displayError(err);
    }
    setIsComputing(false);
  };

  return (
    <>
      <FlexResponsive>
        <Label text="References">
          <ChooseFile
            kind="references"
            fileName={refFileName}
            setFile={setRefFile}
            lines={references}
            linesAreSame={linesAreSame}
          />
        </Label>
        <Label text="Predictions">
          <ChooseFile
            kind="predictions"
            fileName={hypFileName}
            setFile={setHypFile}
            lines={hypotheses}
            linesAreSame={linesAreSame}
          />
        </Label>
      </FlexResponsive>
      <div className="pt-4 flex items-center gap-5">
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
        {getMessages(filesAreInput, linesAreSame, metricIsChoosen).map(
          ([show, message, type]) => show && <Hint type={type} small>{message}</Hint>
        )}
      </div>
    </>
  );
};

export { Upload };
