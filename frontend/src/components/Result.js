import React, { useEffect, useRef } from "react";
import { FaPen, FaSave, FaCalculator } from "react-icons/fa";
import {displayMessage} from "../utils/message"

import { saveCalculationRequest } from "../api";
import { ResultInfo } from "./ResultInfo";
import { Button } from "./utils/Button";
import { Card } from "./utils/Card";

const UploadButton = (props) => (
  <Button variant="primary" {...props}>
    <FaSave style={{ minWidth: "20px" }} />
  </Button>
);

const Result = ({ className, reloadSaved, calculateResult, setCalculateResult, resultRef }) => {
  const nameRef = useRef();

  useEffect(() => {
    if (calculateResult) {
      resultRef.current.scrollIntoView({ block: "start", behavior: "smooth", alignToTop: true });
    }
  }, [calculateResult, resultRef]);

  const upload = () => {
    const name = nameRef.current.value;
    if (!name.trim().length) {
      displayMessage("please enter a name");
      return;
    }
    const scores = calculateResult.scores.metrics;
    const comparisons = calculateResult.comparisons;
    saveCalculationRequest(name, scores, comparisons)
      .then(() => {
        setCalculateResult(null);
        reloadSaved();
      })
      .catch((e) => displayMessage(e.message));
  };

  if (calculateResult !== null) {
    return (
      <Card
        title={
          <div>
            <p className="card-title">
              <FaCalculator /> Results
            </p>
          </div>
        }
        className={className}
      >
        <p className="uk-text-primary" style={{ marginTop: "-25px" }}>
          <FaPen /> Rename and save results
        </p>
        <div className="uk-flex uk-width-1-3">
          <input
            className="uk-input"
            ref={nameRef}
            defaultValue={calculateResult.name}
            onKeyDown={(e) => e.keyCode === 13 && upload()}
          />
          <UploadButton onClick={upload} />
        </div>
        <ResultInfo scoreInfo={calculateResult.scores} comparisons={calculateResult.comparisons} />
      </Card>
    );
  }
  return null;
};

export { Result };
