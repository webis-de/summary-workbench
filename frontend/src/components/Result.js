import React, { useContext, useRef } from "react";
import { FaUpload } from "react-icons/fa";

import { saveCalculationRequest } from "../api";
import { CalculateContext } from "../contexts/CalculateContext";
import { ResultInfo } from "./ResultInfo";
import { Section } from "./utils/Section";

const UploadButton = ({ className, onClick }) => (
  <button className={"uk-button uk-button-primary" + (className !== null ? "" : " " + className)} onClick={onClick}>
    <FaUpload />
  </button>
);

const Result = ({ className, reloadSaved }) => {
  const { calculateResult, setCalculateResult } = useContext(CalculateContext);
  const nameRef = useRef();

  const upload = () => {
    const name = nameRef.current.value;
    const scores = calculateResult.scores;
    const comparisons = calculateResult.comparisons;
    saveCalculationRequest(name, scores, comparisons)
      .then(() => {
        setCalculateResult(null);
        reloadSaved();
      })
      .catch((e) => alert(e));
  };

  if (calculateResult !== null) {
    return (
      <Section
        title={
          <div className="uk-flex">
            <input
              className="uk-input"
              ref={nameRef}
              defaultValue={calculateResult.name}
              onKeyDown={(e) => e.keyCode === 13 && upload()}
            />
            <UploadButton
              onClick={upload} />
          </div>
        }
        className={className}
      >
        <ResultInfo
          scoreInfo={calculateResult.scores}
          comparisons={calculateResult.comparisons}
        />
      </Section>
    );
  } else {
    return null;
  }
};

export { Result };
