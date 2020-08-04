import React, { useContext, useEffect, useMemo, useState } from "react";

import {
  deleteCalculationRequest,
  getSavedCalculationsRequest,
} from "../api";
import { SettingsContext } from "../contexts/SettingsContext";
import { SavedInfo } from "./SavedInfo";
import { MetricBadges } from "./utils/MetricBadges";

const Saved = ({ className, reloadSaved }) => {
  const [calculations, setCalculations] = useState([]);
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    getSavedCalculationsRequest().then((data) => {console.log(data); setCalculations(data)});
  }, []);

  const deleteCalculation = (name) => {
    deleteCalculationRequest(name)
      .then(() => reloadSaved())
      .catch((e) => alert(e));
  };
  const numberCalculations = useMemo(() => calculations.length, [calculations]);
  const allMetrics = useMemo(
    () =>
      Object.entries(settings).map(([metric, { readable }]) => [
        metric,
        readable,
      ]),
    [settings]
  );

  if (numberCalculations > 0) {
    return (
      <ul
        className="uk-padding-small"
        data-uk-accordion
        style={{ border: "1px", borderColor: "grey", borderStyle: "solid" }}
      >
        <li className="uk-open">
          <a className="uk-accordion-title" href="/#">
            Saved Calculations
          </a>
          <div className="uk-accordion-content">
            <ul
              data-uk-accordion
            >
              {calculations.map(({ name, scores }) => (
                <li
                  className="uk-padding-small"
                  key={name}
                  style={{
                    border: "1px",
                    borderColor: "grey",
                    borderStyle: "solid",
                  }}
                >
                  <a
                    title={name}
                    className="uk-accordion-title uk-flex uk-flex-between uk-text-small uk-width-expand"
                    href="/#"
                  >
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {name}
                    </span>
                    <MetricBadges
                      allMetrics={allMetrics}
                      computedMetrics={Object.keys(scores)}
                    />
                  </a>
                  <div className="uk-accordion-content">
                    <SavedInfo
                      name={name}
                      scoreInfo={scores}
                      deleteCalculation={deleteCalculation}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </li>
      </ul>
    );
  } else {
    return null;
  }
};

export { Saved };
