import React, { useContext, useMemo } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { flatten } from "../utils/flatScores";
import { useMarkups } from "../hooks/markup"
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";

const ResultInfo = ({ scores, references, hypotheses }) => {
  const comparisons = useMarkups(useMemo(() => hypotheses.map((hyp, i) => [hyp, references[i]])))

  const { metrics } = useContext(MetricsContext);
  const flatScores = useMemo(() => flatten(scores, metrics), [scores, metrics]);

  return (
    <div>
      <ul className="uk-tab uk-margin" data-uk-tab uk-tab="connect: #result-display;">
        <li>
          <a href="/#">Metrics</a>
        </li>
        <li>
          <a href="/#">Visualize Overlap</a>
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
