import React, { useEffect } from "react";

import { ChooseFile, sameLength, useFile } from "./utils/ChooseFile";
import { FlexResponsive } from "./utils/Layout";
import { Label } from "./utils/Text";

const Upload = ({ setComputeData }) => {
  const { fileName: hypFileName, lines: hypotheses, setFile: setHypFile } = useFile();
  const { fileName: refFileName, lines: references, setFile: setRefFile } = useFile();

  useEffect(
    () =>
      setComputeData({
        id: hypFileName && refFileName ? `${hypFileName}-${refFileName}` : "",
        hypotheses,
        references,
      }),
    [hypFileName, refFileName, hypotheses, references]
  );

  const linesAreSame = sameLength([hypotheses, references]);

  return (
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
  );
};

export { Upload };
