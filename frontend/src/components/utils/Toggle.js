import { Switch } from "@headlessui/react";

const Toggle = ({ enabled, setEnabled }) => (
  <Switch
    checked={enabled}
    onChange={setEnabled}
    className={`${
      enabled ? "bg-blue-600" : "bg-gray-200"
    } relative inline-flex flex-shrink-0 h-[24px] w-[46px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
  >
    <span className="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      className={`${
        enabled ? "translate-x-[22px]" : ""
      } pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
    />
  </Switch>
);

export { Toggle };
