import React, { useEffect, useState } from "react";

import { deleteCalculationRequest, getSavedCalculationsRequest } from "../api";
import { settings } from "../config";
import { displayMessage } from "../utils/message";
import { SavedInfo } from "./SavedInfo";
import { Accordion, AccordionItem } from "./utils/Accordion";

const allMetrics = Object.entries(settings).map(([metric, { readable }]) => [metric, readable]);

const toMetricBadges = (scores) => {
  const computedMetrics = Object.keys(scores);
  return allMetrics.map(([metric, readable]) => [readable, computedMetrics.includes(metric)]);
};

const Saved = ({ className, reloadSaved }) => {
  const [calculations, setCalculations] = useState([]);

  useEffect(() => {
    getSavedCalculationsRequest().then((data) => setCalculations(data));
  }, []);

  const deleteCalculation = (name) => {
    deleteCalculationRequest(name)
      .then(() => reloadSaved())
      .catch((e) => displayMessage(e));
  };

  if (calculations.length > 0) {
    return (
      <Accordion className={className}>
        <AccordionItem text="Saved Calculations" open>
          <Accordion>
            {calculations.map(({ name, scores }) => (
              <AccordionItem key={name} text={name} badges={toMetricBadges(scores)}>
                <SavedInfo name={name} scoreInfo={scores} deleteCalculation={deleteCalculation} />
              </AccordionItem>
            ))}
          </Accordion>
        </AccordionItem>
      </Accordion>
    );
  }
  return null;
};

export { Saved };
