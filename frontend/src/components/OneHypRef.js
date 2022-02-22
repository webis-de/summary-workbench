import React, { useContext, useMemo, useState } from "react";

import { evaluateRequest } from "../api";
import { MetricsContext } from "../contexts/MetricsContext";
import { useMarkup } from "../hooks/markup";
import { flatten } from "../utils/flatScores";
import { displayError } from "../utils/message";
import { ScoreTable } from "./ScoreTable";
import { Button } from "./utils/Button";
import { Textarea } from "./utils/Form";
import { Loading } from "./utils/Loading";
import { Markup } from "./utils/Markup";
import { Table, TableWrapper, Tbody, Td, Tr } from "./utils/Table";
import { Hint } from "./utils/Text";

const OneHypRefResult = ({ calculation }) => {
  const { scores, hypText, refText } = calculation;
  const [hypothesis, reference] = useMarkup(hypText, refText);

  const { metrics } = useContext(MetricsContext);
  const flatScores = useMemo(() => flatten(scores, metrics), [scores, metrics]);
  const markupState = useState();

  return (
    <div>
      <TableWrapper>
        <Table>
          <Tbody>
            <Tr>
              <Td>
                <Markup markups={reference} markupState={markupState} />
              </Td>
              <Td>
                <Markup markups={hypothesis} markupState={markupState} />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableWrapper>
      <ScoreTable flatScores={flatScores} />
    </div>
  );
};

const TextField = ({ value, setValue, placeholder }) => (
  <Textarea
    value={value}
    onChange={(e) => setValue(e.currentTarget.value)}
    rows="8"
    placeholder={placeholder}
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
        setEvaluateResult({ scores, hypText, refText });
      })
      .catch(displayError)
      .finally(() => setIsComputing(false));
  };

  return (
    <>
      {[
        [!hasInput, "Enter a hypothesis and a reference.", "info"],
        [!metricIsChoosen, "Select at least one metric.", "warn"],
      ].map(([show, message, type]) => show && <Hint type={type}>{message}</Hint>)}
      <div className="flex gap-2">
        <TextField value={refText} setValue={setRefText} placeholder="Enter the reference text" />
        <TextField value={hypText} setValue={setHypText} placeholder="Enter the predicted text" />
      </div>
      <div className="flex justify-center">
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
      {evaluateResult && <OneHypRefResult calculation={evaluateResult} />}
    </>
  );
};

export { OneHypRef };
