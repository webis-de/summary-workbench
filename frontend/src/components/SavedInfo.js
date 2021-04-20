import React, { useEffect, useRef, useState, useCallback } from "react";
import UIkit from "uikit";

import { markup } from "../utils/fragcolors";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";
import { DeleteButton } from "./utils/DeleteButton";

const SavedInfo = ({ ID, getCalculationScores, getCalculationLines, deleteCalculation }) => {
  const [scores] = useState(getCalculationScores(ID));
  const [comparisons, setComparisons] = useState(null);
  const toggleID = `toggle-saved-calculation-${ID}`;
  const loadRef = useRef();
  const showEvent = useCallback(() => {
    if (comparisons !== null) return;
    console.log(loadRef.current)
    if (loadRef.current && loadRef.current.className.includes("uk-active")) {
      const { hypotheses, references } = getCalculationLines(ID);
      setComparisons(
        hypotheses.map((hyp, i) => markup(hyp, references[i])),
        [hypotheses, references]
      );
    } else UIkit.util.once(document, "show", `#${toggleID}`, showEvent);
  }, [comparisons, getCalculationLines, ID, toggleID]);
  useEffect(showEvent, [showEvent]);

  return (
    <div>
      <div className="uk-flex uk-flex-middle">
        <ul
          className="uk-tab uk-width-expand uk-margin uk-margin-right"
          data-uk-tab={`connect: #${toggleID};`}
        >
          <li>
            <a href="/#">Metrics</a>
          </li>
          <li>
            <a href="/#">Compare</a>
          </li>
        </ul>
        <DeleteButton onClick={() => deleteCalculation(ID)} />
      </div>
      <ul id={toggleID} className="uk-switcher">
        <li>
          <ScoreTable scores={scores} />
        </li>
        <li ref={loadRef}>{comparisons && <CompareTable comparisons={comparisons} />}</li>
      </ul>
    </div>
  );
};

export { SavedInfo };
