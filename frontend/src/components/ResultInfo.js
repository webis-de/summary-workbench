import React, { useContext, useMemo } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { usePairwiseMarkups } from "../hooks/markup";
import { flatten } from "../utils/flatScores";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";

const ResultInfo = ({ scores, references, hypotheses }) => {
  const comparisons = usePairwiseMarkups(hypotheses, references);

  const { metrics } = useContext(MetricsContext);
  const flatScores = useMemo(() => flatten(scores, metrics), [scores, metrics]);
  const tabStyle={border: "2px solid #1e87f0"};

  return (
    <div>
      <ul className="uk-subnav uk-subnav-pill" data-uk-switcher="connect: #result-display;">
        <li>
          <a href="/#" style={tabStyle}>Metrics</a>
        </li>
        <li>
          <a href="/#" style={tabStyle}>Compare</a>
        </li>
      </ul>
      <ul id="result-display" className="uk-switcher">
        <li>
          <ScoreTable flatScores={flatScores} />
        </li>
        <li>
          <CompareTable comparisons={comparisons} />
        </li>
      </ul>
    </div>
  );
};

export { ResultInfo };
