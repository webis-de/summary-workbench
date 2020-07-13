import React, { useMemo, useState } from "react";

import { getCompareDataRequest } from "../common/api";
import { CompareTable } from "./CompareTable";
import { Export } from "./Export";
import { ScoreTable } from "./ScoreTable";
import { Loading } from "./utils/Loading";
import { DeleteButton } from "./utils/DeleteButton";

const SavedInfo = ({ name, scoreInfo, deleteCalculation }) => {
  const [comparisons, setComparisons] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasScores = useMemo(() => Object.keys(scoreInfo).length > 0, [
    scoreInfo,
  ]);

  const loadComparisons = (key) => {
    if (comparisons === null) {
      setIsLoading(true);
      getCompareDataRequest(name)
        .then(({ comparisons }) => setComparisons(comparisons))
        .finally(() => setIsLoading(false));
    }
  };
  const toggleId = "toggle-" + name;
  return (
    <div>
      <div className="uk-flex uk-flex-middle">
        <ul
          className="uk-tab uk-width-expand uk-margin uk-margin-right"
          data-uk-tab
          uk-tab={"connect: #" + toggleId + ";"}
        >
          <li className="uk-active">
            <a href="/#">Metrics</a>
          </li>
          <li>
            <a href="/#" onClick={loadComparisons}>
              Compare
            </a>
          </li>
          {hasScores && (
            <li>
              <a href="/#">Export</a>
            </li>
          )}
        </ul>
        <DeleteButton onClick={(e) => deleteCalculation(name)} />
      </div>
      <ul id={toggleId} className="uk-switcher">
        <li>
          {hasScores ? (
            <ScoreTable scoreInfo={scoreInfo} />
          ) : (
            "no scores were computed"
          )}
        </li>
        <li>
          <Loading isLoading={isLoading}>
            {comparisons !== null && <CompareTable comparisons={comparisons} />}
          </Loading>
        </li>
        <li>
          <Export scoreInfo={scoreInfo} />
        </li>
      </ul>
    </div>
  );
};

export { SavedInfo };
