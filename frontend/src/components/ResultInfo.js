import React from "react";

import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";
import { SummEvalTable } from "./SummEvalTable";


const ResultInfo = ({ scoreInfo, comparisons }) => {
  const {metrics, summ_eval} = scoreInfo
  const hasScores = Object.keys(metrics).length > 0;

  return <div>
    <ul className="uk-tab uk-margin" data-uk-tab uk-tab="connect: #result-display;">
      {Object.keys(scoreInfo).length > 0 && <li>
        <a href="/#">Metrics</a>
      </li>}
      <li>
        <a href="/#">Visualize Overlap</a>
      </li>
    </ul>
    <ul id="result-display" className="uk-switcher">
      {Object.keys(scoreInfo).length > 0 &&
      <li>
        {hasScores && <ScoreTable scoreInfo={metrics} />}
        {summ_eval !== undefined && <SummEvalTable scoreInfo={summ_eval} />}
      </li>
      }
      <li>
        <CompareTable comparisons={comparisons} />
      </li>
    </ul>
  </div>
}

export { ResultInfo };
