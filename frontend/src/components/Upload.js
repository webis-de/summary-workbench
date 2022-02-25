import React, { useContext, useState } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { Button, LoadingButton } from "./utils/Button";
import { ChooseFile, sameLength, useFile } from "./utils/ChooseFile";
import { FlexResponsive } from "./utils/Layout";
import { Hint, Label } from "./utils/Text";

const getChosenMetrics = (settings) =>
  Object.entries(settings)
    .filter((e) => e[1])
    .map((e) => e[0]);

const Upload = ({ compute, computing }) => {
  const { fileName: hypFileName, setFile: setHypFile, lines: hypotheses } = useFile();
  const { fileName: refFileName, setFile: setRefFile, lines: references } = useFile();

  const { settings } = useContext(MetricsContext);

  const filesAreInput = hypotheses && references;
  const linesAreSame = sameLength([hypotheses, references]);
  const metricIsChoosen = Object.values(settings).some((e) => e);

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
          <LoadingButton />
        ) : (
          <Button
            variant="primary"
            disabled={!filesAreInput || !linesAreSame || !metricIsChoosen}
            onClick={() =>
              compute(
                `${hypFileName}-${refFileName}`,
                getChosenMetrics(settings),
                hypotheses,
                references
              )
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
            <Hint type="warning" small>
              Select at least one metric. The files are not valid because they have different number
              of lines.
            </Hint>
          )}
        </div>
      </div>
    </>
  );
};

export { Upload };
