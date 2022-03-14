import React, { useMemo } from "react";
import { FaTimes } from "react-icons/fa";

import { getChosen } from "../utils/common";
import { Legend, Model, ModelText } from "./Model";
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

const Settings = ({ models, types, toggleSetting, type }) => {
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
          <div>
            {Object.entries(chosenModels).map(([key, { info }]) => (
              <div className="flex items-center gap-2" key={key}>
                <button onClick={() => toggleSetting(key)}>
                  <FaTimes />
                </button>
                <ModelText type={info.metadata.type} text={info.name} />
              </div>
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
