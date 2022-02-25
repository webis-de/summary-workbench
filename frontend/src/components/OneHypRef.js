import React, { useContext, useMemo, useState } from "react";
import { useAsyncFn } from "react-use";

import { evaluateRequest } from "../api";
import { MetricsContext } from "../contexts/MetricsContext";
import { useMarkup } from "../hooks/markup";
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

  const { metrics } = useContext(MetricsContext);
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

const getChosenMetrics = (metrics) =>
  Object.entries(metrics)
    .filter((e) => e[1])
    .map((e) => e[0]);

const OneHypRef = () => {
  const [hypText, setHypText] = useState("");
  const [refText, setRefText] = useState("");
  const { settings } = useContext(MetricsContext);

  const [state, doFetch] = useAsyncFn(async () => {
    const { scores } = await evaluateRequest(getChosenMetrics(settings), [hypText], [refText]);
    return { scores, hypText, refText };
  }, [settings, hypText, refText]);

  const hasInput = hypText.trim() && refText.trim();
  const metricIsChoosen = Object.values(settings).some((e) => e);

  return (
    <SpaceGap>
      <FlexResponsive>
        <TextField value={refText} setValue={setRefText} placeholder="Enter the reference text." />
        <TextField value={hypText} setValue={setHypText} placeholder="Enter the predicted text." />
      </FlexResponsive>
      {state.loading ? (
        <LoadingButton />
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
