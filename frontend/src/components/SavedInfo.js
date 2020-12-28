import React, { useState } from "react";

import { getCalculationDataRequest } from "../api";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";
import { DeleteButton } from "./utils/DeleteButton";
import { Loading } from "./utils/Loading";

let toggleKey = 0;

const SavedInfo = ({ name, scoreInfo, deleteCalculation }) => {
  const [comparisons, setComparisons] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasScores = Object.keys(scoreInfo).length > 0;

  const loadComparisons = () => {
    if (comparisons === null) {
      setIsLoading(true);
      getCalculationDataRequest(name)
        .then((data) => setComparisons(data.comparisons))
        .finally(() => setIsLoading(false));
    }
  };
  const toggleId = `toggle-saved-calculation-${toggleKey}`;
  toggleKey += 1;

  return (
    <div>
      <div className="uk-flex uk-flex-middle">
        <ul
          className="uk-tab uk-width-expand uk-margin uk-margin-right"
          data-uk-tab
          uk-tab={`connect: #${toggleId};`}
        >
          <li>
            <a href="/#">Metrics</a>
          </li>
          <li>
            <a href="/#" onClick={loadComparisons}>
              Compare
            </a>
          </li>
        </ul>
        <DeleteButton onClick={() => deleteCalculation(name)} />
      </div>
      <ul id={toggleId} className="uk-switcher">
        <li>{hasScores ? <ScoreTable scoreInfo={scoreInfo} /> : "no scores were computed"}</li>
        <li>
          {isLoading ? (
            <Loading />
          ) : (
            <>{comparisons !== null && <CompareTable comparisons={comparisons} />}</>
          )}
        </li>
      </ul>
    </div>
  );
};

export { SavedInfo };
