import { useEffect, useState } from "react";

import { Input, Textarea } from "./Form";
import { Toggle } from "./Toggle";

const RightInfo = ({ children }) => (
  <span className="rounded-r-lg bg-black ring-1 ring-black text-white px-1 flex whitespace-nowrap items-center text-sm">
    {children}
  </span>
);

const TextareaField = ({ value: initValue, setValue: setInitValue }) => {
  const [value, setValue] = useState(initValue);
  const accept = () => setInitValue(value);
  useEffect(() => {
    setValue(initValue);
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
  const [value, setValue] = useState(initValue);
  const accept = () => setInitValue(value);
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

const Categories = ({ onChange, value, categories }) => (
  <div className="w-full">
    <select
      value={categories.indexOf(value)}
      onChange={(e) => {
        const index = e.target.value;
        let result = null;
        if (index >= 0) result = categories[index];
        onChange(result);
      }}
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

const StringArgument = ({ value, setValue, textarea }) => {
  if (textarea) return <TextareaField value={value} setValue={setValue} />;
  return <InputField value={value} setValue={setValue} />;
};

const Argument = ({ value, schema, setValue }) => {
  if (schema.enum) return <Categories value={value} categories={schema.enum} onChange={setValue} />;
  const { textarea } = schema;
  const { minimum, maximum } = schema;
  switch (schema.type) {
    case "integer":
      return <InputField value={value} setValue={setValue} min={minimum} max={maximum} />;
    case "number":
      return <InputField value={value} setValue={setValue} min={minimum} max={maximum} />;
    case "boolean":
      return <Toggle checked={value} onChange={setValue} />;
    case "string":
      return <StringArgument value={value} setValue={setValue} textarea={textarea} />;
    default:
      return <StringArgument value={value} setValue={setValue} textarea={textarea} />;
  }
};

export { Argument };
