import { useEffect, useState } from "react";

import { Input } from "./Form";
import { Toggle } from "./Toggle";

const RightInfo = ({ children }) => (
  <span className="rounded-r-lg bg-black ring-1 ring-black text-white px-1 flex whitespace-nowrap items-center text-sm">
    {children}
  </span>
);

const InputField = ({ value: initValue, onDone, min, max }) => {
  const [value, setValue] = useState(initValue);
  const accept = () => setValue(onDone(value));
  useEffect(() => {
    setValue(initValue);
  }, [initValue, setValue]);

  return (
    <div className="w-full flex">
      <Input
        value={value === undefined ? "" : value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyDown={(e) => e.keyCode === 13 && accept()}
        flatRight={min !== undefined || max !== undefined}
        small
        onBlur={accept}
      />
      {(min !== undefined || max !== undefined) && (
        <RightInfo>{`${min !== undefined ? `${min} ≤` : ""} x ${
          max !== undefined ? `≤ ${max}` : ""
        }`}</RightInfo>
      )}
    </div>
  );
};

const parse = (value, parseFunc, min, max) => {
  if (value === "" || value === undefined) return undefined;
  let parsed = parseFunc(value);
  if (Number.isNaN(parsed)) parsed = 0;
  if (min !== undefined && parsed < min) parsed = min;
  if (max !== undefined && parsed > max) parsed = max;
  return parsed;
};

const Categories = ({ value, setValue, categories }) => (
  <div className="w-full">
    <select
      value={categories.indexOf(value)}
      onChange={(e) => setValue(categories[e.target.value])}
      className="form-select appearance-none block w-full px-3 py-1 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded-lg focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
    >
      <option value={-1}>-- select a value --</option>
      {categories.map((category, i) => (
        <option key={category} value={i}>
          {category}
        </option>
      ))}
    </select>
  </div>
);

const IntArgument = ({ value, setValue, min, max }) => (
  <InputField
    value={value}
    min={min}
    max={max}
    onDone={(v) => {
      const parsed = parse(v, parseInt, min, max);
      setValue(parsed);
      return parsed;
    }}
  />
);
const BoolArgument = ({ value, setValue }) => <Toggle checked={value} onChange={setValue} />;
const FloatArgument = ({ value, setValue, min, max }) => (
  <InputField
    value={value}
    min={min}
    max={max}
    onDone={(v) => {
      const parsed = parse(v, parseFloat, min, max);
      setValue(parsed);
      return parsed;
    }}
  />
);
const StringArgument = ({ value, setValue }) => (
  <InputField
    value={value}
    onDone={(v) => {
      const parsed = v === "" ? undefined : v;
      setValue(parsed);
      return parsed;
    }}
  />
);
const CategoricalArgument = Categories;

const Argument = ({ type, ...props }) => {
  switch (type) {
    case "int":
      return <IntArgument {...props} />;
    case "float":
      return <FloatArgument {...props} />;
    case "bool":
      return <BoolArgument {...props} />;
    case "str":
      return <StringArgument {...props} />;
    case "categorical":
      return <CategoricalArgument {...props} />;
    default:
      throw new Error(`unknown type ${type}`);
  }
};

export { Argument };
