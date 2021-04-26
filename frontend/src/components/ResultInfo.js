import React, { useContext, useMemo } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { flatten } from "../utils/flatScores";
import { markup } from "../utils/fragcolors";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";

const ResultInfo = ({ scores, hypotheses, references }) => {
  const comparisons = useMemo(() => hypotheses.map((hyp, i) => markup(hyp, references[i])), [
    hypotheses,
    references,
  ]);

  const { metrics } = useContext(MetricsContext);
  const flatScores = useMemo(() => flatten(scores, metrics), [scores, metrics]);
  console.log(flatScores)

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
