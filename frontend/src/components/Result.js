import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

import { ResultInfo } from "./ResultInfo";
import { Button } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { Input } from "./utils/Form";
import { HeadingSemiBig, Hint } from "./utils/Text";

const Result = ({ calculation, saveCalculation }) => {
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
    <Card full>
      <CardHead>
        <HeadingSemiBig>Result</HeadingSemiBig>
      </CardHead>
      <CardContent>
        <div>
          <div className="flex max-w-[400px]">
            <Input
              value={calcID}
              onChange={(e) => setCalcID(e.currentTarget.value)}
              onKeyDown={(e) => e.keyCode === 13 && save()}
              flatRight
            />
            <Button onClick={save} flatLeft>
              Save
            </Button>
          </div>
        </div>
        {infoText && <Hint type="info">{infoText}</Hint>}
        <ResultInfo scores={scores} hypotheses={hypotheses} references={references} />
      </CardContent>
    </Card>
  );
};

export { Result };
