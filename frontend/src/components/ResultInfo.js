import React from "react";

import { CompareTable } from "./CompareTable";
import { Export } from "./Export";
import { ScoreTable } from "./ScoreTable";

const ResultInfo = ({ scoreInfo, comparisons }) => {
  const hasScores = Object.keys(scoreInfo).length > 0;

  return (
  <div>
    <ul className="uk-tab uk-margin" data-uk-tab uk-tab="connect: #result-display;">
      <li className="uk-active"><a href="/#">Metrics</a>
      </li>
      <li><a href="/#">Compare</a>
      </li>
      {hasScores && (
      <li><a href="/#">Export</a>
          </li>
      )}
    </ul>
    <ul id="result-display" className="uk-switcher">
      <li>
        <ScoreTable scoreInfo={scoreInfo} />
      </li>
      <li>
        <CompareTable comparisons={comparisons} />
      </li>
      <li>
          <Export scoreInfo={scoreInfo} />
      </li>
      </ul>
  </div>
  );
};

export { ResultInfo };
