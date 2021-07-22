import React, { useContext, useMemo } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { useMarkups } from "../hooks/markup";
import { flatten } from "../utils/flatScores";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";

const ResultInfo = ({ scores, references, hypotheses }) => {
  const comparisons = useMarkups(references, hypotheses);

  const { metrics } = useContext(MetricsContext);
  const flatScores = useMemo(() => flatten(scores, metrics), [scores, metrics]);

  return (
    <div>
      <ul className="uk-subnav uk-subnav-pill" data-uk-switcher="connect: #result-display;">
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
