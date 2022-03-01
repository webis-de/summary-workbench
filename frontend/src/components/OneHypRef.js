import React, { useContext, useMemo, useState } from "react";
import { useAsyncFn } from "react-use";

import { evaluateRequest } from "../api";
import { MetricsContext } from "../contexts/MetricsContext";
import { useMarkup } from "../hooks/markup";
import { getChosen } from "../utils/common";
import { flatten } from "../utils/flatScores";
import { ScoreTable } from "./ScoreTable";
import { Button, LoadingButton } from "./utils/Button";
import { Textarea } from "./utils/Form";
import { FlexResponsive, SpaceGap } from "./utils/Layout";
import { Markup } from "./utils/Markup";
import { Table, TableWrapper, Tbody, Td, Tr } from "./utils/Table";
import { HeadingMedium } from "./utils/Text";

const OneHypRefResult = ({ calculation }) => {
  const { scores, hypText, refText } = calculation;
  const [hypothesis, reference] = useMarkup(hypText, refText);

  const { metrics: rawMetrics } = useContext(MetricsContext);
  const metrics = useMemo(() => Object.fromEntries(Object.entries(rawMetrics).map(([key, {info}]) =>[key,info])), [rawMetrics])
  const flatScores = useMemo(() => flatten(scores, metrics), [scores, metrics]);
  const markupState = useState();

  return (
    <SpaceGap big>
      <div>
        <HeadingMedium>Overlap</HeadingMedium>
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
      </div>
      <div>
        <HeadingMedium>Scores</HeadingMedium>
        <ScoreTable flatScores={flatScores} />
      </div>
    </SpaceGap>
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

const OneHypRef = () => {
  const [hypText, setHypText] = useState("");
  const [refText, setRefText] = useState("");
  const { metrics } = useContext(MetricsContext);

  const [state, doFetch] = useAsyncFn(async () => {
    const { scores } = await evaluateRequest(Object.keys(getChosen(metrics)), [hypText], [refText]);
    return { scores, hypText, refText };
  }, [metrics, hypText, refText]);

  const hasInput = hypText.trim() && refText.trim();
  const metricIsChoosen = Boolean(Object.keys(getChosen(metrics)).length);

  return (
    <SpaceGap>
      <FlexResponsive>
        <TextField value={refText} setValue={setRefText} placeholder="Enter the reference text." />
        <TextField value={hypText} setValue={setHypText} placeholder="Enter the predicted text." />
      </FlexResponsive>
      {state.loading ? (
        <LoadingButton text="Evaluating" />
      ) : (
        <Button variant="primary" disabled={!hasInput || !metricIsChoosen} onClick={doFetch}>
          Evaluate
        </Button>
      )}
      {!state.loading && state.value && (
        <div>
          <div className="mt-4">
            <OneHypRefResult calculation={state.value} />
          </div>
        </div>
      )}
    </SpaceGap>
  );
};

export { OneHypRef };
