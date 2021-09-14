import React from "react";
import { FaQuestionCircle } from "react-icons/fa";

import { SavedInfo } from "./SavedInfo";
import { Accordion, AccordionItem } from "./utils/Accordion";

const Saved = ({ className, calculations, deleteCalculation }) => (
  <div className={className}>
    <div className="uk-flex uk-flex-middle uk-margin-bottom">
      <h3 style={{ margin: 0, marginRight: "20px" }}>Saved Calculations</h3>
      <FaQuestionCircle
        className="tooltip-icon"
        data-uk-tooltip="title: the data is stored in the browser; pos: right;"
      />
    </div>
    <Accordion>
      {calculations.map((calculation, index) => (
        <AccordionItem key={calculation.id} text={calculation.id} badges={Object.keys(calculation.scores).map((name) => calculation.metrics[name].name)}>
          <SavedInfo
            index={index}
            calculation={calculation}
            deleteCalculation={() => deleteCalculation(calculation.id)}
          />
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export { Saved };
