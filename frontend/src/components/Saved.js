import React from "react";
import { FaQuestionCircle } from "react-icons/fa";

import { SavedInfo } from "./SavedInfo";
import { Badge, BadgeGroup } from "./utils/Badge";
import { Disclosure, DisclosureContent, DisclosureToggle } from "./utils/Disclosure";
import { HeadingBig, HeadingMedium } from "./utils/Text";
import { Tooltip } from "./utils/Tooltip";

const SavedEntry = ({ calculation, deleteCalculation }) => {
  const badges = Object.keys(calculation.scores).map((name) => calculation.metrics[name].name);
  return (
    <div className="shadow-md">
      <Disclosure key={calculation.id}>
        <div className="border border-black rounded-lg divide-y divide-gray-300">
          <DisclosureToggle>
            <div className="p-4 flex justify-between items-center w-full">
              <HeadingMedium>{calculation.id}</HeadingMedium>
              <BadgeGroup>
                {badges.map((badge, i) => (
                  <Badge key={i}>{badge}</Badge>
                ))}
              </BadgeGroup>
            </div>
          </DisclosureToggle>
          <DisclosureContent>
            <div className="p-4">
              <SavedInfo calculation={calculation} deleteCalculation={deleteCalculation} />
            </div>
          </DisclosureContent>
        </div>
      </Disclosure>
    </div>
  );
};

const Saved = ({ className, calculations, deleteCalculation }) => (
  <div className={className}>
    <div className="pb-4 flex items-center gap-2">
      <HeadingBig>Saved Calculations</HeadingBig>
      <Tooltip place="right" text="the data is stored in the browser">
        <FaQuestionCircle className="w-5 text-blue-500 hover:text-blue-700" />
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
