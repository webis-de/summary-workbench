import {useState, useEffect } from "react"
import { Input } from "./Form"
import { Toggle } from "./Toggle";

const InputField = ({ value: initValue, onDone }) => {
  const [value, setValue] = useState(initValue);
  const accept = () => onDone(value);
  useEffect(() => {
    setValue(initValue);
  }, [initValue, setValue]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
      onKeyDown={(e) => e.keyCode === 13 && accept()}
      small
      onBlur={accept}
    />
  );
};

const parse = (value, parseFunc, min, max) => {
  let parsed = parseFunc(value);
  if (Number.isNaN(parsed)) parsed = 0;
  if (min !== undefined && parsed < min) parsed = min;
  if (max !== undefined && parsed > max) parsed = max;
  return parsed;
};

const Categories = ({ value, setValue, categories }) => (
  <div className="flex justify-center">
    <div className="mb-3 xl:w-96">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="form-select appearance-none
      block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat
      border border-solid border-gray-300 rounded transition ease-in-out m-0
      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const IntArgument = ({ value, setValue, min, max }) => (
  <InputField value={value} onDone={(v) => setValue(parse(v, parseInt, min, max))} />
);
const BoolArgument = ({ value, setValue }) => <Toggle checked={value} onChange={setValue} />;
const FloatArgument = ({ value, setValue, min, max }) => (
  <InputField value={value} onDone={(v) => setValue(parse(v, parseFloat, min, max))} />
);
const StringArgument = ({ value, setValue }) => <InputField value={value} onDone={setValue} />;
const CategoricalArgument = Categories;

const Argument = ({type, ...props}) => {
  switch (type) {
    case "int": return <IntArgument {...props} />
    case "float": return <FloatArgument {...props} />
    case "bool": return <BoolArgument {...props} />
    case "str": return <StringArgument {...props} />
    case "categorical": return <CategoricalArgument {...props} />
    default: throw new Error(`unknown type ${type}`)
  }
}

export { Argument };
