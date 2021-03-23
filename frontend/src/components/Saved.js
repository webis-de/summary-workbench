import React, { useEffect, useState } from "react";

import { deleteCalculationRequest, getSavedCalculationsRequest } from "../api";
import { metrics } from "../config";
import { displayMessage } from "../utils/message";
import { SavedInfo } from "./SavedInfo";
import { Accordion, AccordionItem } from "./utils/Accordion";

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
              <AccordionItem
                key={name}
                text={name}
                badges={Object.keys(scores).map((key) => metrics[key].readable)}
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
