import React, { useReducer, useContext } from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import { SettingsContext } from "../contexts/SettingsContext";

const Export = ({ scoreInfo }) => {
  const { settings } = useContext(SettingsContext);

  const [chosenMetrics, toggleMetric] = useReducer(
    // implement toggle logic
    (state, metric) => ({ ...state, [metric]: !state[metric] }),
    // map all metrics to false
    Object.keys(scoreInfo).reduce(
      (obj, metric) => ({ ...obj, [metric]: false }),
      {}
    )
  );

  return <>
    <ButtonGroup className="m-2 d-flex flex-column flex-sm-row">
      {Object.entries(chosenMetrics).map(([metric, is_chosen]) => {
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
    <Button className="m-2">CSV</Button>
    <Button className="m-2">LaTeX</Button>
  </>
};

export { Export };
