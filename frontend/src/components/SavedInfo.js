import React from "react";

import { usePairwiseMarkups } from "../hooks/markup";
import { flatten } from "../utils/flatScores";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";
import { DeleteButton } from "./utils/Button";
import { Pill, TabContent, TabHead, TabPanel, Tabs } from "./utils/Tabs";

const SavedInfo = ({ calculation, deleteCalculation }) => {
  const { scores, metrics, hypotheses, references } = calculation;
  const flatScores = flatten(scores, metrics);
  const comparisons = usePairwiseMarkups(hypotheses, references);

  return (
    <Tabs>
      <div className="flex justify-between items-center pb-3">
        <TabHead>
          <Pill>Scores</Pill>
          <Pill>Visualize Overlap</Pill>
        </TabHead>
        <DeleteButton onClick={deleteCalculation} />
      </div>
      <TabContent>
        <TabPanel>
          <ScoreTable flatScores={flatScores} />
        </TabPanel>
        <TabPanel>{comparisons.length && <CompareTable comparisons={comparisons} />}</TabPanel>
      </TabContent>
    </Tabs>
  );
};

export { SavedInfo };
