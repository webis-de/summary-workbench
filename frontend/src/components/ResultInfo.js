import React, { useMemo } from "react";

import { markup } from "../utils/fragcolors";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";

const ResultInfo = ({ scores, hypotheses, references }) => {
  const comparisons = useMemo(() => hypotheses.map((hyp, i) => markup(hyp, references[i])), [
    hypotheses,
    references,
  ]);

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
          <ScoreTable scores={scores} />
        </li>
        <li>
          <CompareTable comparisons={comparisons} />
        </li>
      </ul>
    </div>
  );
};

export { ResultInfo };
