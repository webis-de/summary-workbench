import React, { useContext } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { getChosen } from "../utils/common";
import { Button, LoadingButton } from "./utils/Button";
import { ChooseFile, sameLength, useFile } from "./utils/ChooseFile";
import { FlexResponsive } from "./utils/Layout";
import { Hint, Label } from "./utils/Text";

const Upload = ({ compute, computing }) => {
  const { fileName: hypFileName, lines: hypotheses, setFile: setHypFile } = useFile();
  const { fileName: refFileName, lines: references, setFile: setRefFile } = useFile();

  const { metrics } = useContext(MetricsContext);

  const filesAreInput = hypotheses && references;
  const linesAreSame = sameLength([hypotheses, references]);
  const chosenMetrics = Object.keys(getChosen(metrics));
  const metricIsChoosen = Boolean(chosenMetrics.length);

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
        {computing ? (
          <LoadingButton text="Evaluating" />
        ) : (
          <Button
            variant="primary"
            disabled={!filesAreInput || !linesAreSame || !metricIsChoosen}
            onClick={() =>
              compute(`${hypFileName}-${refFileName}`, chosenMetrics, hypotheses, references)
            }
          >
            Evaluate
          </Button>
        )}
        <div className="flex flex-col">
          {!filesAreInput && (
            <Hint type="info" small>
              Both files must contain the same number of non-empty lines. Each line is interpreted
              as a sentence.
            </Hint>
          )}
          {!linesAreSame && (
            <Hint type="warning" small>
              The files are not valid because they have different number of lines.
            </Hint>
          )}
          {!metricIsChoosen && (
            <Hint type="info" small>
              Select at least one metric.
            </Hint>
          )}
        </div>
      </div>
    </>
  );
};

export { Upload };
