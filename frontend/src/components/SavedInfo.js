import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import UIkit from "uikit";

import { flatten } from "../utils/flatScores";
import { computeMarkup } from "../utils/markup";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";
import { DeleteButton } from "./utils/DeleteButton";

const SavedInfo = ({ index, calculation, deleteCalculation }) => {
  const {scores, metrics, hypotheses, references} = calculation
  const flatScores = flatten(scores, metrics);
  const [comparisons, setComparisons] = useState(null);
  const toggleID = `toggle-saved-calculation-${index}`;
  const loadRef = useRef();
  const showEvent = useCallback(() => {
    if (comparisons !== null) return;
    if (loadRef.current && loadRef.current.className.includes("uk-active")) {
      setComparisons(
        hypotheses.map((hyp, i) => computeMarkup([hyp, references[i]])),
        [hypotheses, references]
      );
    } else UIkit.util.once(document, "show", `#${toggleID}`, showEvent);
  }, [comparisons, toggleID]);
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
        <DeleteButton onClick={deleteCalculation} />
      </div>
      <ul id={toggleID} className="uk-switcher">
        <li>
          <ScoreTable flatScores={flatScores} />
        </li>
        <li ref={loadRef}>{comparisons && <CompareTable comparisons={comparisons} />}</li>
      </ul>
    </div>
  );
};

export { SavedInfo };
