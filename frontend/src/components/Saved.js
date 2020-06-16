import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";

import {
  deleteCalculationRequest,
  getSavedCalculationsRequest,
} from "../common/api";
import { SettingsContext } from "../contexts/SettingsContext";
import { SavedInfo } from "./SavedInfo";
import { DeleteButton } from "./utils/DeleteButton";
import { MetricBadges } from "./utils/MetricBadges";
import { ToggleSavedButton } from "./utils/ToggleSavedButton";

const Saved = ({ className, reloadSaved }) => {
  const [open, toggleOpen] = useReducer((open) => !open, true);
  const [calculations, setCalculations] = useState([]);
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    getSavedCalculationsRequest().then((data) => setCalculations(data));
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
      <Card className={className}>
        <Card.Body>
          <ToggleSavedButton
            onClick={toggleOpen}
            numberCalculations={numberCalculations}
          />
          <Collapse in={open}>
            <Accordion className="mt-4">
              {calculations.map(({ name, scores }) => (
                <Card key={name}>
                  <Card.Header className="d-flex justify-content-between">
                    <div className="d-md-flex flex-grow-1 justify-content-between">
                      <Accordion.Toggle
                        as={Button}
                        variant="link"
                        eventKey={name}
                      >
                        {name}
                      </Accordion.Toggle>
                      <MetricBadges
                        allMetrics={allMetrics}
                        computedMetrics={Object.keys(scores)}
                      />
                    </div>
                    <DeleteButton onClick={() => deleteCalculation(name)} />
                  </Card.Header>
                  <Accordion.Collapse eventKey={name}>
                    <Card.Body>
                      <SavedInfo name={name} scoreInfo={scores} />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              ))}
            </Accordion>
          </Collapse>
        </Card.Body>
      </Card>
    );
  } else {
    return null;
  }
};

export { Saved };
