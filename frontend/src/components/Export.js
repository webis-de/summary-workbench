import React, { useState, useReducer, useContext } from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { SettingsContext } from "../contexts/SettingsContext";
import { getExportRequest } from "../common/api";

const Export = ({ scoreInfo }) => {
  const { settings } = useContext(SettingsContext);
  const [exportText, setExportText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transpose, toggleTranspose] = useReducer((state) => !state, true);
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
        for (const [metric, is_chosen] of Object.entries(chosenMetrics)) {
          if (is_chosen) {
            scores[metric] = scoreInfo[metric];
          }
        }
        setIsLoading(true);
        getExportRequest(scores, format, transpose, parsedPrecision)
          .then((response) => response.json())
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
        {Object.entries(chosenMetrics).sort().map(([metric, is_chosen]) => {
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
      {isLoading ? (
        <Spinner className="my-3" animation="border" size="sm" />
      ) : (
        <div className="d-flex flex-md-row flex-column justify-content-md-between">
          <div className="my-3 d-flex">
            <Button
              className="mr-4 flex-fill"
              variant="success"
              onClick={() => exportAs("csv")}
            >
              CSV
            </Button>
            <Button
              className="flex-fill"
              variant="primary"
              onClick={() => exportAs("latex")}
            >
              LaTeX
            </Button>
          </div>
          <div className="my-3 d-flex">
            <InputGroup className="ml-md-4 mr-4">
              <InputGroup.Prepend>
                <InputGroup.Text>precision</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                onChange={(e) => {
                  setPrecision(e.target.value);
                }}
                value={precision}
              />
            </InputGroup>
            <Button
              variant={transpose ? "default" : "primary"}
              onClick={() => toggleTranspose()}
            >
              transpose
            </Button>
          </div>
        </div>
      )}
      {exportText !== null && <pre className="p-4 border">{exportText}</pre>}
    </>
  );
};

export { Export };
