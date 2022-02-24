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
          selected ? "text-blue-500 border-blue-500" : "hover:border-gray-400 border-transparent"
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
          selected
            ? "bg-blue-600 border-blue-600 text-white cursor-default ring-2 ring-sky-300"
            : "text-black bg-slate-200 hover:bg-slate-300 border-slate-300"
        } px-4 py-2 text-sm font-medium rounded border`}
      >
        {children}
      </button>
    )}
  </HTab>
);

const TabPanel = ({ children }) => <HTab.Panel>{children}</HTab.Panel>;

const Tabs = ({ onChange, children }) => <HTab.Group onChange={onChange}>{children}</HTab.Group>;

export { Tabs, Tab, TabHead, TabContent, TabPanel, Pill };
