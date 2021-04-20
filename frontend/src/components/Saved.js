import React from "react";
import { FaQuestionCircle } from "react-icons/fa";

import { SavedInfo } from "./SavedInfo";
import { Accordion, AccordionItem } from "./utils/Accordion";

const Saved = ({
  className,
  calculationIDs,
  deleteCalculation,
  getCalculationScores,
  getCalculationLines,
}) => {
  if (!calculationIDs.length) return null;
  return (
    <div className={className}>
      <div className="uk-flex uk-flex-middle uk-margin-bottom">
        <h3 style={{margin: 0, marginRight: "20px"}}>Saved Calculations</h3>
        <FaQuestionCircle className="tooltip-icon" data-uk-tooltip="title: the data is stored in the browser; pos: right;"/>
      </div>
      <Accordion>
        {calculationIDs.map((ID) => {
          const scores = getCalculationScores(ID);
          return (
            <AccordionItem key={ID} text={ID} badges={Object.keys(scores)}>
              <SavedInfo
                ID={ID}
                getCalculationScores={getCalculationScores}
                getCalculationLines={getCalculationLines}
                deleteCalculation={deleteCalculation}
              />
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export { Saved };
