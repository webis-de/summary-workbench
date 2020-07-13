import React, { useContext, useReducer, useState } from "react";

import { Button } from "./utils/Button";
import { getExportRequest } from "../common/api";
import { SettingsContext } from "../contexts/SettingsContext";
import { Loading } from "./utils/Loading";

const LatexButton = ({ onClick }) => <Button onClick={onClick}>Latex</Button>;
const CSVButton = ({ onClick }) => <Button onClick={onClick}>CSV</Button>;

const TransposeButton = ({ isTransposed, onClick }) => (
  <Button
    size="small"
    variant={isTransposed ? "default" : "primary"}
    onClick={onClick}
  >
    transpose
  </Button>
);

const ExportPreview = ({ text }) =>
  text !== null && (
    <pre className="uk-padding-small" style={{ border: "solid 1px grey" }}>
      {text}
    </pre>
  );

const PrecionField = ({ onChange }) => (
  <input className="uk-input" placeholder="precision" onChange={onChange} />
);

const Export = ({ scoreInfo }) => {
  const { settings } = useContext(SettingsContext);
  const [exportText, setExportText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransposed, toggleTranspose] = useReducer((state) => !state, true);
  const [precision, setPrecision] = useReducer(
    (state, newValue) => newValue.replace(/\D/g, ""),
    "3"
  );

  const [chosenMetrics, toggleMetric] = useReducer(
    // implement toggle logic
    (state, metric) => ({ ...state, [metric]: !state[metric] }),
    // map all metrics to false
    Object.keys(scoreInfo).reduce(
      (obj, metric) => ({ ...obj, [metric]: true }),
      {}
    )
  );

  const exportAs = (format) => {
    if (Object.values(chosenMetrics).some((v) => v === true)) {
      const parsedPrecision = parseInt(precision.replace(/\D/g, ""));
      if (!isNaN(parsedPrecision) && parsedPrecision >= 0) {
        const scores = {};
        Object.entries(chosenMetrics)
          .filter(([metric, is_chosen]) => is_chosen)
          .forEach(
            ([metric, is_chosen]) => (scores[metric] = scoreInfo[metric])
          );
        setIsLoading(true);
        getExportRequest(scores, format, isTransposed, parsedPrecision)
          .then((json) => setExportText(json["text"]))
          .catch(() => alert("server not available"))
          .finally(() => setIsLoading(false));
      } else {
        alert("choose valid precision");
      }
    } else {
      alert("choose Metrics to export");
    }
  };

  return (
    <>
      <div
        className="uk-flex uk-flex-between uk-flex-wrap"
        style={{ gridRowGap: "10px" }}
      >
        {Object.entries(chosenMetrics)
          .sort()
          .map(([metric, is_chosen]) => (
            <Button
              variant={is_chosen ? "primary" : "default"}
              size="medium"
              key={metric}
              onClick={() => toggleMetric(metric)}
            >
              {settings[metric]["readable"]}
            </Button>
          ))}
      </div>
      <div className="uk-flex uk-flex-between uk-flex-middle uk-flex-wrap-reverse uk-margin"
        style={{ gridRowGap: "20px" }}
      >
        <div className="uk-flex">
          <CSVButton onClick={() => exportAs("csv")} />
          <LatexButton onClick={() => exportAs("latex")} />
        </div>

        <div className="uk-flex">
          <PrecionField
            precision={precision}
            onChange={(e) => {
              setPrecision(e.target.value);
            }}
          />
          <TransposeButton
            isTransposed={isTransposed}
            onClick={() => toggleTranspose()}
          />
        </div>
      </div>
      <Loading isLoading={isLoading}>
        <ExportPreview text={exportText} />
      </Loading>
    </>
  );
};

export { Export };
