import React, { useMemo } from "react";
import { FaTimes } from "react-icons/fa";

import { getChosen } from "../utils/common";
import { Legend, Model, ModelText } from "./Model";
import { Argument } from "./utils/Arguments";
import { LiveSearch, useFilter } from "./utils/FuzzySearch";
import { HeadingMedium } from "./utils/Text";

const SelectModels = ({ keys, models, selectModel }) => (
  <div>
    {Object.values(models).length ? (
      <div className="flex flex-col border border-slate-400 overflow-y-auto overflow-x-hidden h-[300px] shadow-md">
        {keys.map((key) => {
          const { info, isSet } = models[key];
          return <Model key={key} info={info} onClick={() => selectModel(key)} isSet={isSet} />;
        })}
      </div>
    ) : (
      <div>no models configured</div>
    )}
  </div>
);

const ArgumentLayout = ({ name, argDefault, definition, setValue }) => {
  const { display } = definition;
  const title = typeof display === "string" ? display : name;
  let className = "flex";
  if (definition.type === "str") className += " flex-col";
  else className += " items-center flex-row gap-2";
  return (
    <div className={className}>
      <span
        title={title}
        className="grow whitespace-nowrap text-sm overflow-hidden overflow-ellipsis"
      >
        {title}
      </span>
      <div className="flex items-center">
        <Argument value={argDefault} setValue={setValue} definition={definition} />
      </div>
    </div>
  );
};

const ModelBox = ({ info, args, setArgument, close }) => {
  const mappedArgs = useMemo(
    () => Object.entries(args).map(([argName, argDefault]) => [argName, { value: argDefault }]),
    [args]
  );
  return (
    <div className="border border-gray-400 bg-gray-100 flex flex-col divide-y divide-gray-300">
      <div className="px-2 py-[1px] flex justify-between">
        <ModelText type={info.metadata.type} text={info.name} />
        <button onClick={close}>
          <FaTimes />
        </button>
      </div>
      {Boolean(Object.keys(args).length) && (
        <div className="px-2 py-1 flex flex-col gap-2">
          {mappedArgs.map(([argName, argDefault]) => (
            <ArgumentLayout
              key={argName}
              name={argName}
              argDefault={argDefault}
              definition={info.arguments[argName]}
              setValue={(v) => setArgument(info.key, argName, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
const Settings = ({ models, types, toggleSetting, setArgument, type }) => {
  const modelKeys = useMemo(() => Object.keys(models).sort(), [models]);
  const { query, setQuery, filteredKeys } = useFilter(modelKeys);

  const chosenModels = getChosen(models);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <LiveSearch query={query} setQuery={setQuery} />
        <div className="flex items-center">
          <HeadingMedium>Selected {type}</HeadingMedium>
        </div>
        <SelectModels keys={filteredKeys} models={models} selectModel={toggleSetting} />
        <div className="flex flex-col gap-1 p-1 border border-slate-400 overflow-y-auto overflow-x-hidden h-[300px] shadow-md bg-white">
          {Object.entries(chosenModels).map(([key, { info, arguments: args }]) => (
            <ModelBox
              key={key}
              info={info}
              args={args}
              setArgument={setArgument}
              close={() => toggleSetting(key)}
            />
          ))}
        </div>
      </div>
      <div className="pt-2">
        <Legend types={types} />
      </div>
    </div>
  );
};

export { Settings };
