import React, { useContext, useReducer, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";

import { getExportRequest } from "../common/api";
import { SettingsContext } from "../contexts/SettingsContext";
import { Loading } from "./utils/Loading";

const LatexButton = ({ onClick }) => (
  <Button className="mr-4 flex-fill" variant="success" onClick={onClick}>
    Latex
  </Button>
);
const CSVButton = ({ onClick }) => (
  <Button className="mr-4 flex-fill" variant="primary" onClick={onClick}>
    CSV
  </Button>
);

const TransposeButton = ({ isTransposed, onClick }) => (
  <Button variant={isTransposed ? "default" : "primary"} onClick={onClick}>
    transpose
  </Button>
);

const ExportPreview = ({ text }) =>
  text !== null && <pre className="p-4 border">{text}</pre>;

const PrecionField = ({ onChange, precision }) => (
  <InputGroup className="ml-md-4 mr-4">
    <InputGroup.Prepend>
      <InputGroup.Text>precision</InputGroup.Text>
    </InputGroup.Prepend>
    <FormControl onChange={onChange} value={precision} />
  </InputGroup>
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
      <ButtonGroup className="my-2 d-flex flex-md-row flex-column">
        {Object.entries(chosenMetrics)
          .sort()
          .map(([metric, is_chosen]) => {
            return (
              <Button
                className="border-dark"
                key={metric}
                variant={is_chosen ? "primary" : "default"}
                onClick={() => toggleMetric(metric)}
              >
                {settings[metric]["readable"]}
              </Button>
            );
          })}
      </ButtonGroup>
      <Loading isLoading={isLoading}>
        <div className="d-flex flex-md-row flex-column justify-content-md-between">
          <div className="my-3 d-flex">
            <CSVButton onClick={() => exportAs("csv")} />
            <LatexButton onClick={() => exportAs("latex")} />
          </div>
          <div className="my-3 d-flex">
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
      </Loading>
      <ExportPreview text={exportText} />
    </>
  );
};

export { Export };
