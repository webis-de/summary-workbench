import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { usePairwiseMarkups } from "../hooks/markup";
import { flatten } from "../utils/flatScores";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";
import { Button } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { Input } from "./utils/Form";
import { Pill, TabContent, TabHead, TabPanel, Tabs } from "./utils/Tabs";
import { HeadingSemiBig, Hint } from "./utils/Text";

const Result = ({ calculation, saveCalculation }) => {
  const { id, scores, hypotheses, references } = calculation;
  const [calcID, setCalcID] = useState(id);
  const [infoText, setInfoText] = useState(null);
  const comparisons = usePairwiseMarkups(hypotheses, references);

  const { metrics: rawMetrics } = useContext(MetricsContext);
  const metrics = useMemo(
    () => Object.fromEntries(Object.entries(rawMetrics).map(([key, { info }]) => [key, info])),
    [rawMetrics]
  );
  const flatScores = useMemo(() => flatten(scores, metrics), [scores, metrics]);

  const scrollRef = useRef();
  useEffect(() => {
    scrollRef.current.scrollIntoView({ block: "start", behavior: "smooth", alignToTop: true });
  }, []);

  const save = async () => {
    try {
      await saveCalculation(calcID);
    } catch ({ message }) {
      if (message === "NOID") setInfoText("no name given");
      else if (message === "TAKEN") setInfoText(`name '${calcID.trim()}' is already taken`);
      else setInfoText(`error: ${message}`);
    }
  };

  return (
    <div ref={scrollRef} className="scroll-m-20">
      <Card full>
        <CardHead>
          <HeadingSemiBig>Result</HeadingSemiBig>
        </CardHead>
        <CardContent>
          <Tabs>
            <div className="flex gap-8 items-center">
              <TabHead>
                <Pill>Scores</Pill>
                <Pill>Visualize Overlap</Pill>
              </TabHead>
              <div className="inline-flex max-w-[400px] items-stretch">
                <Input
                  value={calcID}
                  onChange={(e) => setCalcID(e.currentTarget.value)}
                  onKeyDown={(e) => e.keyCode === 13 && save()}
                  flatRight
                />
                <Button onClick={save} flatLeft>
                  Save
                </Button>
              </div>
              {infoText && (
                <Hint small type="info">
                  {infoText}
                </Hint>
              )}
            </div>
            <TabContent>
              <TabPanel>
                <ScoreTable flatScores={flatScores} />
              </TabPanel>
              <TabPanel>
                <CompareTable comparisons={comparisons} />
              </TabPanel>
            </TabContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { Result };
