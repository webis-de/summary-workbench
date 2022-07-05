import { useEffect, useState } from "react";

import { Input, Textarea } from "./Form";
import { Toggle } from "./Toggle";

const RightInfo = ({ children }) => (
  <span className="rounded-r-lg bg-black ring-1 ring-black text-white px-1 flex whitespace-nowrap items-center text-sm">
    {children}
  </span>
);

const TextareaField = ({ value: initValue, setValue: setInitValue }) => {
  const [value, setValue] = useState(initValue.value);
  const accept = () => setInitValue(value);
  useEffect(() => {
    setValue(initValue.value);
  }, [initValue, setValue]);
  return (
    <Textarea
      value={value === undefined ? "" : value}
      tight
      rows={4}
      onChange={(e) => setValue(e.currentTarget.value)}
      onBlur={accept}
    />
  );
};

const InputField = ({ value: initValue, setValue: setInitValue, min, max }) => {
  const [value, setValue] = useState(initValue.value);
  const accept = () => setInitValue(value);
  useEffect(() => {
    setValue(initValue.value);
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

const Categories = ({ value, setValue, definition: { categories } }) => (
  <div className="w-full">
    <select
      value={categories.indexOf(value.value)}
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

const IntArgument = ({ value, setValue, definition: { min, max } }) => (
  <InputField value={value} min={min} max={max} setValue={setValue} />
);
const BoolArgument = ({ value, setValue }) => <Toggle checked={value.value} onChange={setValue} />;
const FloatArgument = ({ value, setValue, definition: { min, max } }) => (
  <InputField value={value} min={min} max={max} setValue={setValue} />
);
const StringArgument = ({ value, setValue, definition: { useTextarea } }) => {
  if (useTextarea) return <TextareaField value={value} setValue={setValue} />;
  return <InputField value={value} setValue={setValue} />;
};
const CategoricalArgument = Categories;

const Argument = ({ type, value, setValue, definition }) => {
  switch (definition.type) {
    case "int":
      return <IntArgument value={value} setValue={setValue} definition={definition} />;
    case "float":
      return <FloatArgument value={value} setValue={setValue} definition={definition} />;
    case "bool":
      return <BoolArgument value={value} setValue={setValue} definition={definition} />;
    case "str":
      return <StringArgument value={value} setValue={setValue} definition={definition} />;
    case "categorical":
      return <CategoricalArgument value={value} setValue={setValue} definition={definition} />;
    default:
      throw new Error(`unknown type ${type}`);
  }
};

export { Argument };
