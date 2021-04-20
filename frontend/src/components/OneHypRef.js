import React, { useContext, useState } from "react";

import { evaluateRequest } from "../api";
import { MetricsContext } from "../contexts/MetricsContext";
import { markup } from "../utils/fragcolors";
import { displayMessage } from "../utils/message";
import { Markup } from "./Markup";
import { ScoreTable } from "./ScoreTable";
import { Button } from "./utils/Button";
import { InfoText } from "./utils/InfoText";
import { Loading } from "./utils/Loading";

const OneHypRefResult = ({ className, calculation }) => {
  const { scores, hypothesis, reference } = calculation;

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
      <ScoreTable scores={scores} />
    </div>
  );
};

const TextField = ({ value, setValue, placeholder }) => (
  <textarea
    className="uk-textarea"
    value={value}
    onChange={(e) => setValue(e.currentTarget.value)}
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

  const hasInput = hypText.trim() && refText.trim();
  const metricIsChoosen = Object.values(settings).some((e) => e);

  const compute = () => {
    setIsComputing(true);
    evaluateRequest(getChosenMetrics(settings), [hypText], [refText])
      .then(({ scores }) => {
        const [hypothesis, reference] = markup(hypText, refText);
        setEvaluateResult({ scores, hypothesis, reference });
      })
      .catch((e) => displayMessage(e))
      .finally(() => setIsComputing(false));
  };

  return (
    <>
      <InfoText
        messages={[
          [!hasInput, "Enter a hypothesis and a reference.", false],
          [!metricIsChoosen, "Select at least one metric.", true],
        ]}
      />
      <div className="uk-margin uk-child-width-1-2@s">
        <TextField value={refText} setValue={setRefText} placeholder="Enter the reference text" />
        <TextField value={hypText} setValue={setHypText} placeholder="Enter the generated text" />
      </div>
      <div className="uk-flex uk-flex-between">
        <div className="uk-flex uk-flex-left">
          {isComputing ? (
            <Loading />
          ) : (
            <Button
              variant="primary"
              disabled={!hasInput || !metricIsChoosen}
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
      {evaluateResult && <OneHypRefResult className="uk-margin" calculation={evaluateResult} />}
    </>
  );
};

export { OneHypRef };
