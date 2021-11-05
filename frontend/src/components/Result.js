import React, { useState } from "react";
import { FaCalculator, FaInfoCircle } from "react-icons/fa";

import { ResultInfo } from "./ResultInfo";
import { Button } from "./utils/Button";
import { Card, CardBody, CardHeader, CardTitle } from "./utils/Card";

const UploadButton = (props) => (
  <Button variant="primary" {...props} style={{ whiteSpace: "nowrap" }}>
    Save
  </Button>
);

const Result = ({ className, calculation, saveCalculation }) => {
  const { id, scores, hypotheses, references } = calculation;
  const [calcID, setCalcID] = useState(id);
  const [infoText, setInfoText] = useState(null);

  const save = async () => {
    try {
      await saveCalculation(calcID);
    } catch ({ message }) {
      if (message === "NOID") setInfoText("no name given");
      else if (message === "TAKEN") setInfoText(`name '${calcID.trim()}' is already taken`);
      else setInfoText(`error: ${message}`);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <FaCalculator /> Results
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div
          className="uk-flex uk-flex-middle"
          style={{ marginTop: "-10px", marginBottom: "20px" }}
        >
          <div className="uk-flex uk-width-1-3" style={{ flexGrow: "1", maxWidth: "500px" }}>
            <input
              className="uk-input"
              value={calcID}
              onChange={(e) => setCalcID(e.currentTarget.value)}
              onKeyDown={(e) => e.keyCode === 13 && save()}
            />
            <UploadButton onClick={save} />
          </div>
        </div>
        {infoText && (
          <div className="uk-margin uk-text-primary uk-text-danger">
            <FaInfoCircle /> {infoText}
          </div>
        )}
        <ResultInfo scores={scores} hypotheses={hypotheses} references={references} />
      </CardBody>
    </Card>
  );
};

export { Result };
