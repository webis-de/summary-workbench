import React from "react";

import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";

const ResultInfo = ({ scoreInfo, comparisons }) => {
  const { metrics } = scoreInfo;
  const hasScores = Object.keys(metrics).length > 0;

  return (
    <div>
      <ul className="uk-tab uk-margin" data-uk-tab uk-tab="connect: #result-display;">
        {hasScores && (
          <li>
            <a href="/#">Metrics</a>
          </li>
        )}
        <li>
          <a href="/#">Visualize Overlap</a>
        </li>
      </ul>
      <ul id="result-display" className="uk-switcher">
        {hasScores && <li>{hasScores && <ScoreTable scoreInfo={metrics} />}</li>}
        <li>
          <CompareTable comparisons={comparisons} />
        </li>
      </ul>
    </div>
  );
};

export { ResultInfo };
