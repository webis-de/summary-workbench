import { RadioGroup as Radio } from "@headlessui/react";
import React from "react";

const withRadio =
  (Component) =>
  ({ value, ...props }) =>
    (
      <Radio.Option className={({ checked }) => (checked ? "z-10" : "")} value={value}>
        {({ checked }) => <Component checked={checked} {...props} />}
      </Radio.Option>
    );

const RadioGroup = ({ value, setValue, children }) => (
  <Radio value={value} onChange={setValue}>
    {children}
  </Radio>
);

const convertGroupToStyle = (group) => {
  switch (group) {
    case "first":
      return "rounded-t-md";
    case "middle":
      return "";
    case "last":
      return "rounded-b-md";
    default:
      return "rounded-md";
  }
};

const RadioButton = withRadio(({ checked, group, children }) => (
  <button
    className={`${
      checked
        ? "bg-gray-600 text-white ring-4 ring-black"
        : "text-gray-900 bg-white hover:text-white hover:bg-gray-400 ring-1 ring-gray-700"
    } py-2 px-4 text-sm font-medium w-full
    ${convertGroupToStyle(group)}`}
  >
    {children}
  </button>
));

const RadioOption = withRadio(({ checked, children }) => (
  <label className="flex items-center whitespace-nowrap">
    <input
      type="radio"
      className="form-radio w-4 h-4 rounded-2 border-gray-300 bg-gray-100 focus:ring-2 focus:ring-blue-300"
      checked={checked}
    />
    <span className="ml-2 text-gray-700">{children}</span>
  </label>
));

export { RadioGroup, RadioOption, RadioButton, withRadio };
