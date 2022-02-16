import { Tab as HTab } from "@headlessui/react";
import React from "react";

const TabHead = ({ children, full, border }) => (
  <HTab.List
    className={`${full ? "w-full" : ""} ${
      border ? "border-b border-gray-200" : ""
    } flex flex-wrap gap-2`}
  >
    {children}
  </HTab.List>
);
const TabContent = ({ children }) => <HTab.Panels>{children}</HTab.Panels>;
const Tab = ({ children }) => (
  <HTab as={React.Fragment}>
    {({ selected }) => (
      <button
        className={`${
          selected
            ? "text-indigo-500 border-indigo-500"
            : "hover:border-gray-400 border-transparent"
        } px-2 py-2 border-b-2`}
      >
        {children}
      </button>
    )}
  </HTab>
);

const Pill = ({ children }) => (
  <HTab as={React.Fragment}>
    {({ selected }) => (
      <button
        className={`${
          selected ? "bg-blue-600 text-white shadow-md cursor-default" : "text-gray-800 bg-gray-200 hover:bg-gray-300"
        } px-4 py-2 text-sm font-medium rounded`}
      >
        {children}
      </button>
    )}
  </HTab>
);

const TabPanel = ({ children }) => <HTab.Panel>{children}</HTab.Panel>;

const Tabs = ({ onChange, children }) => <HTab.Group onChange={onChange}>{children}</HTab.Group>;

export { Tabs, Tab, TabHead, TabContent, TabPanel, Pill };
