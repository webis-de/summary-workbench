import React, { useContext, useRef, useState } from "react";
import { Button } from "./utils/Button";
import { FaKeyboard } from "react-icons/fa";
import { Section } from "./utils/Section";
import { ComputeButton } from "./utils/ComputeButton";

import { evaluateRequest } from "../api";
import { markup } from "../utils/fragcolors";
import { SettingsContext } from "../contexts/SettingsContext";
import { Markup } from "./Markup";
import { ScoreTable } from "./ScoreTable";

const OneHypRefResult = ({ className, scoreInfo, hypothesis, reference }) => {
  const hasScores = Object.keys(scoreInfo).length > 0;

  return (
    <div className={className}>
      <table className="uk-table uk-margin">
        <tbody>
          <tr>
            <td>
              <Markup markupedText={hypothesis} />
            </td>
            <td>
              <Markup markupedText={reference} />
            </td>
          </tr>
        </tbody>
      </table>
      {hasScores && <ScoreTable scoreInfo={scoreInfo} />}
    </div>
  );
};

const OneHypRef = ({ className }) => {
  const hypRef = useRef();
  const refRef = useRef();
  const [evaluateResult, setEvaluateResult] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const { settings } = useContext(SettingsContext);

  const getChosenMetrics = () => {
    const chosenMetrics = [];
    for (const [metric, metricInfo] of Object.entries(settings)) {
      if (metricInfo.is_set) {
        chosenMetrics.push(metric);
      }
    }
    return chosenMetrics;
  };

  const getComparison = (hypdata, refdata) => {
    const [hyp, ref] = markup(hypdata, refdata);
    return [hyp, ref];
  };

  const compute = () => {
    const hypdata = hypRef.current.value;
    const refdata = refRef.current.value;
    if (hypdata.trim() === "" || refdata.trim() === "") {
      alert("no hypothesis or reference given");
      return;
    }
    setIsComputing(true);
    evaluateRequest(getChosenMetrics(settings), [hypdata], [refdata])
      .then((scores) => {
        const [hyp, ref] = getComparison(hypdata, refdata);
        setEvaluateResult({ scores, hyp, ref });
      })
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <>
      <Section
        title={
          <>
            <FaKeyboard /> Single Example
          </>
        }
        className={className ? className : ""}
      >
        <div className="uk-margin uk-child-width-1-2@s">
          <textarea
            className="uk-textarea"
            ref={hypRef}
            as="textarea"
            rows="5"
            placeholder="Enter the generated hypothesis"
          />
          <textarea
            className="uk-textarea"
            ref={refRef}
            as="textarea"
            rows="5"
            placeholder="Enter the reference text"
          />
        </div>
        <div className="uk-flex uk-flex-between">
          <ComputeButton isComputing={isComputing} onClick={compute} methodCalled={"Evaluate"} />
          <Button
            variant="primary"
            onClick={() => {
              hypRef.current.value = "";
              refRef.current.value = "";
            }}
          >
            Clear
          </Button>
        </div>
        {evaluateResult !== null && (
          <OneHypRefResult
            className="uk-margin"
            scoreInfo={evaluateResult.scores}
            hypothesis={evaluateResult.hyp}
            reference={evaluateResult.ref}
          />
        )}
      </Section>
    </>
  );
};

export { OneHypRef };
