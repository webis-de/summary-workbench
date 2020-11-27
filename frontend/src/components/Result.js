import React, { useRef, useEffect } from "react";
import UIkit from "uikit";
import { FaSave } from "react-icons/fa";
import { FaCalculator } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { saveCalculationRequest } from "../api";
import { ResultInfo } from "./ResultInfo";
import { Section } from "./utils/Section";

const UploadButton = ({ className, onClick }) => (
  <button className={"uk-button uk-button-primary" + (className !== null ? "" : " " + className)} onClick={onClick}>
    <FaSave />
  </button>
);

const Result = ({ className, reloadSaved, calculateResult, setCalculateResult, resultRef }) => {
  const nameRef = useRef();

  useEffect(() => {
    if (calculateResult) {
      resultRef.current.scrollIntoView({ block: "start", behavior: "smooth",  alignToTop: true});
    }
  }, [calculateResult, resultRef]);

  const upload = () => {
    const name = nameRef.current.value;
    if (!name.trim().length) {
      UIkit.notification({ message: "please enter a name", status: "danger" });
      return;
    }
    const scores = calculateResult.scores["metrics"];
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
          <div>
            <p className="card-title"><FaCalculator /> Results</p>
          </div>
        }
        className={className}
      >
        <p className="uk-text-primary" style={{"marginTop":"-25px"}}> <FaPen /> Rename and save results </p>
        <div className="uk-flex uk-width-1-3">
            <input
              className="uk-input"
              ref={nameRef}
              defaultValue={calculateResult.name}
              onKeyDown={(e) => e.keyCode === 13 && upload()}
            />
            <UploadButton
                onClick={upload} />
              </div>
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
