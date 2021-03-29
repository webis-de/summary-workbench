import React, { useEffect, useState, useContext } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { deleteCalculationRequest, getSavedCalculationsRequest } from "../api";
import { displayMessage } from "../utils/message";
import { SavedInfo } from "./SavedInfo";
import { Accordion, AccordionItem } from "./utils/Accordion";

const Saved = ({ className, reloadSaved }) => {
  const [calculations, setCalculations] = useState([]);
  const { loading, metrics } = useContext(MetricsContext)

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
              <AccordionItem
                key={name}
                text={name}
                badges={loading ? null : Object.keys(scores).map((key) => metrics[key].readable)}
              >
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
