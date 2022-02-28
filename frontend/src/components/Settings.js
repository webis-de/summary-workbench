import React, { useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";

import { Legend, Model, ModelText } from "./Model";
import { LiveSearch, useFilter } from "./utils/FuzzySearch";
import { HeadingMedium } from "./utils/Text";

const getChosenModels = (settings) =>
  Object.entries(settings)
    .filter((e) => e[1])
    .map((e) => e[0]);

const SelectModels = ({ keys, models, settings, selectModel }) => (
  <div>
    {Object.values(models).length ? (
      <div className="flex flex-col border border-slate-400 overflow-y-auto overflow-x-hidden h-[300px] shadow-md">
        {keys.map((key) => (
          <Model
            key={key}
            info={models[key]}
            onClick={() => selectModel(key)}
            isSet={settings[key]}
          />
        ))}
      </div>
    ) : (
      <div>no models configured</div>
    )}
  </div>
);

const Settings = ({ models, settings, toggleSetting, type }) => {
  const modelKeys = useMemo(() => Object.keys(models).sort(), [models]);
  const { query, setQuery, filteredKeys } = useFilter(modelKeys);
  const [selectedModel, setSelectedModel] = useState(null);

  const selectModel = (key) => {
    if (settings[key]) setSelectedModel(null);
    else setSelectedModel(key);
    toggleSetting(key);
  };
  const unselectModel = (key) => {
    toggleSetting(key);
    if (selectedModel === key) setSelectedModel(null);
  };

  const chosenModels = getChosenModels(settings);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <LiveSearch query={query} setQuery={setQuery} />
          <SelectModels
            keys={filteredKeys}
            models={models}
            settings={settings}
            selectModel={selectModel}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="p-[5px]">
            <HeadingMedium>Selected {type}</HeadingMedium>
          </div>
          <div>
            {chosenModels.map((model) => (
              <div className="flex items-center gap-2" key={model}>
                <button onClick={() => unselectModel(model)}>
                  <FaTimes />
                </button>
                <ModelText type={models[model].type} text={models[model].name} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-2">
        <Legend models={models} />
      </div>
    </div>
  );
};

export { Settings };
