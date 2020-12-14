import React, { useContext, useState } from "react";
import UIkit from "uikit";

import { evaluateRequest } from "../api";
import { SettingsContext } from "../contexts/SettingsContext";
import { markup } from "../utils/fragcolors";
import { Markup } from "./Markup";
import { ScoreTable } from "./ScoreTable";
import { Button } from "./utils/Button";
import { Loading } from "./utils/Loading";

const OneHypRefResult = ({ className, scoreInfo, hypothesis, reference }) => {
  const { metrics } = scoreInfo;
  const hasScores = Object.keys(metrics).length > 0;

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
      {hasScores && <ScoreTable scoreInfo={metrics} />}
    </div>
  );
};

const TextField = ({ value, setValue, placeholder }) => (
  <textarea
    className="uk-textarea"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    as="textarea"
    rows="5"
    placeholder={placeholder}
    style={{ resize: "none", overflow: "auto" }}
  />
);

const OneHypRef = () => {
  const [hypText, setHypText] = useState("");
  const [refText, setRefText] = useState("");
  const [evaluateResult, setEvaluateResult] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const { settings } = useContext(SettingsContext);

  const getChosenMetrics = () => {
    const chosenMetrics = [];
    for (const [metric, metricInfo] of Object.entries(settings)) {
      if (metricInfo.isSet) {
        chosenMetrics.push(metric);
      }
    }
    return chosenMetrics;
  };

  const getComparison = (hypdata, refdata) => {
    const [hyp, ref] = markup(hypdata, refdata);
    return [hyp, ref];
  };

  const compute = (summ_eval = false) => {
    if (hypText.trim() === "" || refText.trim() === "") {
      UIkit.notification({ message: "no hypothesis or reference given", status: "danger" });
      return;
    }
    setIsComputing(true);
    evaluateRequest(getChosenMetrics(settings), [hypText], [refText], summ_eval)
      .then((scores) => {
        const [hyp, ref] = getComparison(hypText, refText);
        setEvaluateResult({ scores, hyp, ref });
      })
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <>
      <div className="uk-margin uk-child-width-1-2@s">
        <TextField value={hypText} setValue={setHypText} placeholder="Enter the reference text" />
        <TextField value={refText} setValue={setRefText} placeholder="Enter the generated text" />
      </div>
      <div className="uk-flex uk-flex-between">
        <div className="uk-flex uk-flex-left">
          <Loading isLoading={isComputing}>
            <Button
              variant="primary"
              disabled={!hypText.length || !refText.length}
              onClick={() => compute(false)}
            >
              Evaluate
            </Button>
            <div />
            {/* <Button variant="primary" onClick={() => compute(true)}>
              {"Evaluate with SummEval"}
            </Button> */}
          </Loading>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setHypText("");
            setRefText("");
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
    </>
  );
};

export { OneHypRef };
