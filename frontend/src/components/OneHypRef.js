import React, { useContext, useState } from "react";
import UIkit from "uikit";

import { evaluateRequest } from "../api";
import { MetricsContext } from "../contexts/MetricsContext";
import { markup } from "../utils/fragcolors";
import { displayMessage } from "../utils/message";
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

const getChosenMetrics = (metrics) =>
  Object.entries(metrics)
    .filter((e) => e[1])
    .map((e) => e[0]);

const OneHypRef = () => {
  const [hypText, setHypText] = useState("");
  const [refText, setRefText] = useState("");
  const [evaluateResult, setEvaluateResult] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const { settings } = useContext(MetricsContext);

  const compute = () => {
    if (hypText.trim() === "" || refText.trim() === "") {
      UIkit.notification({ message: "no hypothesis or reference given", status: "danger" });
      return;
    }
    setIsComputing(true);
    evaluateRequest(getChosenMetrics(settings), [hypText], [refText])
      .then((scores) => {
        const [hyp, ref] = markup(hypText, refText);
        setEvaluateResult({ scores, hyp, ref });
      })
      .catch((e) => displayMessage(e))
      .finally(() => setIsComputing(false));
  };

  return (
    <>
      <div className="uk-margin uk-child-width-1-2@s">
        <TextField value={hypText} setValue={setHypText} placeholder="Enter the reference text" />
        <TextField value={refText} setValue={setRefText} placeholder="Enter the generated text" />
      </div>
      <div className="uk-flex uk-flex-between">
        <div className="uk-flex uk-flex-left">
          {isComputing ? (
            <Loading />
          ) : (
            <Button
              variant="primary"
              disabled={!hypText.length || !refText.length}
              onClick={() => compute()}
            >
              Evaluate
            </Button>
          )}
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
      {evaluateResult && (
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
