import React from "react";
import { FaQuestionCircle } from "react-icons/fa";

import { HoverProvider } from "../contexts/HoverContext";
import { ScoreWorkbench } from "./ScoreWorkbench";
import { Badge, BadgeGroup } from "./utils/Badge";
import { Button, DeleteButton } from "./utils/Button";
import { Disclosure, DisclosureContent, DisclosureToggle } from "./utils/Disclosure";
import { Modal, useModal } from "./utils/Modal";
import { HeadingBig, HeadingMedium } from "./utils/Text";
import { Tooltip } from "./utils/Tooltip";

const SavedEntry = ({ calculation, deleteCalculation }) => {
  const { id, metrics } = calculation;
  const [isOpen, openModal, closeModal] = useModal();
  return (
    <div className="shadow-md rounded-lg">
      <Modal isOpen={isOpen} close={closeModal} fit>
        <div className="p-4 max-w-[400px] divide-y">
          <div className="whitespace-nowrap overflow-hidden overflow-ellipsis">
            Delete {'"'}
            {calculation.id}
            {'"'}?
          </div>
          <div className="pt-2 flex justify-end gap-4">
            <Button variant="success" appearance="soft" onClick={deleteCalculation}>
              Yes
            </Button>
            <Button variant="danger" appearance="soft" onClick={closeModal}>
              No
            </Button>
          </div>
        </div>
      </Modal>
      <HoverProvider>
        <Disclosure>
          <div className="border border-black rounded-lg divide-y divide-gray-300">
            <div className="flex items-center px-4 gap-4">
              <DisclosureToggle>
                <div className="h-12 flex justify-between items-center w-full">
                  <HeadingMedium raw>{id}</HeadingMedium>
                  <BadgeGroup>
                    {metrics.map((metric, i) => (
                      <Badge key={i}>{metric}</Badge>
                    ))}
                  </BadgeGroup>
                </div>
              </DisclosureToggle>
              <DeleteButton onClick={openModal} />
            </div>
            <DisclosureContent>
              <div className="p-4">
                <ScoreWorkbench calculation={calculation} />
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
        <FaQuestionCircle size={18} className="text-blue-500 hover:text-blue-700" />
      </Tooltip>
    </div>
    <div className="flex flex-col gap-2">
      {calculations.map((calculation) => (
        <SavedEntry
          key={calculation.id}
          calculation={calculation}
          deleteCalculation={() => deleteCalculation(calculation.id)}
        />
      ))}
    </div>
  </div>
);

export { Saved };
