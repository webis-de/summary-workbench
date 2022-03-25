import React from "react";
import { FaQuestionCircle } from "react-icons/fa";

import { HoverProvider } from "../contexts/HoverContext";
import { ScoreWorkbench } from "./ScoreWorkbench";
import { Badge, BadgeGroup } from "./utils/Badge";
import { DeleteButton } from "./utils/Button";
import { Disclosure, DisclosureContent, DisclosureToggle } from "./utils/Disclosure";
import { HeadingBig, HeadingMedium } from "./utils/Text";
import { Tooltip } from "./utils/Tooltip";

const SavedEntry = ({ calculation, deleteCalculation }) => {
  const { id, metrics } = calculation;
  return (
    <div className="shadow-md rounded-lg">
      <HoverProvider>
        <Disclosure>
          <div className="border border-black rounded-lg divide-y divide-gray-300">
            <DisclosureToggle>
              <div className="px-4 h-12 flex justify-between items-center w-full">
                <HeadingMedium raw>{id}</HeadingMedium>
                <BadgeGroup>
                  {metrics.map((metric, i) => (
                    <Badge key={i}>{metric}</Badge>
                  ))}
                </BadgeGroup>
              </div>
            </DisclosureToggle>
            <DisclosureContent>
              <div className="p-4">
                <ScoreWorkbench
                  calculation={calculation}
                  RightToken={<DeleteButton onClick={deleteCalculation} />}
                />
              </div>
            </DisclosureContent>
          </div>
        </Disclosure>
      </HoverProvider>
    </div>
  );
};

const Saved = ({ calculations, deleteCalculation }) => (
  <div>
    <div className="pb-4 flex items-center gap-2">
      <HeadingBig>Saved Calculations</HeadingBig>
      <Tooltip place="right" text="the data is stored in the browser">
        <FaQuestionCircle className="w-5 h-5 text-blue-500 hover:text-blue-700" />
      </Tooltip>
    </div>
    <div className="flex flex-col gap-2">
      {calculations.map((calculation, index) => (
        <SavedEntry
          key={index}
          calculation={calculation}
          deleteCalculation={() => deleteCalculation(calculation.id)}
        />
      ))}
    </div>
  </div>
);

export { Saved };
