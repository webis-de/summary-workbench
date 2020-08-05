import React from "react";

import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";

const ResultInfo = ({ scoreInfo, comparisons }) => (
  <div>
    <ul className="uk-tab uk-margin" data-uk-tab uk-tab="connect: #result-display;">
      {Object.keys(scoreInfo).length > 0 && <li>
        <a href="/#">Metrics</a>
      </li>}
      <li>
        <a href="/#">Compare</a>
      </li>
    </ul>
    <ul id="result-display" className="uk-switcher">
      {Object.keys(scoreInfo).length > 0 &&
      <li>
        <ScoreTable scoreInfo={scoreInfo} />
      </li>
      }
      <li>
        <CompareTable comparisons={comparisons} />
      </li>
    </ul>
  </div>
);

export { ResultInfo };
