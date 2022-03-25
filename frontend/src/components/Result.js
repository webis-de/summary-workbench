import React, { useEffect, useRef, useState } from "react";

import { HoverProvider } from "../contexts/HoverContext";
import { ScoreWorkbench } from "./ScoreWorkbench";
import { Button } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { Input } from "./utils/Form";
import { HeadingSemiBig, Hint } from "./utils/Text";

const SaveField = ({ defaultID = "", saveID }) => {
  const [calcID, setCalcID] = useState(defaultID);
  const [errors, setErrors] = useState([]);

  const save = async () => {
    try {
      await saveID(calcID);
    } catch ({ message }) {
      if (message === "NOID") setErrors(["no name given"]);
      else if (message === "TAKEN") setErrors([`name '${calcID.trim()}' is already taken`]);
      else setErrors([`error: ${message}`]);
    }
  };

  return (
    <div className="flex items-center gap-10">
      {errors.map((error) => (
        <Hint key={error} small type="danger">
          {error}
        </Hint>
      ))}
      <div className="inline-flex max-w-[400px] items-stretch">
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
  );
};

const Result = ({ calculation, saveCalculation }) => {
  const { id } = calculation;

  const scrollRef = useRef();
  useEffect(() => {
    scrollRef.current.scrollIntoView({ block: "start", behavior: "smooth", alignToTop: true });
  }, []);

  const saveID = (calcID) => saveCalculation({ ...calculation, id: calcID });

  return (
    <div ref={scrollRef} className="scroll-m-20">
      <HoverProvider>
        <Card full>
          <CardHead>
            <HeadingSemiBig>Result</HeadingSemiBig>
          </CardHead>
          <CardContent>
            <ScoreWorkbench
              calculation={calculation}
              RightToken={<SaveField defaultID={id} saveID={saveID} />}
            />
          </CardContent>
        </Card>
      </HoverProvider>
    </div>
  );
};

export { Result };
