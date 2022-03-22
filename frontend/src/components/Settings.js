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

const ModelBox = ({ info, args, setArgument, close }) => (
  <div className="border border-gray-500 flex flex-col divide-y divide-gray-300">
    <div className="px-2 py-[1px] flex justify-between">
      <ModelText type={info.metadata.type} text={info.name} />
      <button onClick={close}>
        <FaTimes />
      </button>
    </div>
    {Boolean(Object.keys(args).length) && (
      <div className="px-2 py-1">
        {Object.entries(args).map(([argName, argDefault]) => (
          <div key={argName} className="flex items-center gap-2">
            <span className="text-sm">{argName}</span>
            <div className="grow flex items-center">
              <Argument
                value={argDefault}
                setValue={(v) => setArgument(info.key, argName, v)}
                {...info.arguments[argName]}
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
const Settings = ({ models, types, toggleSetting, setArgument, type }) => {
  const modelKeys = useMemo(() => Object.keys(models).sort(), [models]);
  const { query, setQuery, filteredKeys } = useFilter(modelKeys);

  const chosenModels = getChosen(models);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <LiveSearch query={query} setQuery={setQuery} />
          <SelectModels keys={filteredKeys} models={models} selectModel={toggleSetting} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="p-[5px]">
            <HeadingMedium>Selected {type}</HeadingMedium>
          </div>
          <div className="flex flex-col gap-1">
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
      </div>
      <div className="pt-2">
        <Legend types={types} />
      </div>
    </div>
  );
};

export { Settings };
