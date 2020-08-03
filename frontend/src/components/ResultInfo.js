import React from "react";

import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";

const ResultInfo = ({ scoreInfo, comparisons }) => (
  <div>
    <ul className="uk-tab uk-margin" data-uk-tab uk-tab="connect: #result-display;">
      <li className="uk-active">
        <a href="/#">Metrics</a>
      </li>
      <li>
        <a href="/#">Compare</a>
      </li>
    </ul>
    <ul id="result-display" className="uk-switcher">
      <li>
        <ScoreTable scoreInfo={scoreInfo} />
      </li>
      <li>
        <CompareTable comparisons={comparisons} />
      </li>
    </ul>
  </div>
);

export { ResultInfo };
