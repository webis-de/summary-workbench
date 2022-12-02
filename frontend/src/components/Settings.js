import React, { useContext, useMemo } from "react";
import { FaTimes } from "react-icons/fa";

import { Legend, Model, ModelText } from "./Model";
import { Argument } from "./utils/Arguments";
import { LiveSearch, useFilter } from "./utils/FuzzySearch";
import { HeadingMedium, Hint } from "./utils/Text";

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

const ArgumentLayout = ({ value, schema, setValue, error }) => {
  let className = "flex justify-between";
  if (schema.type === "boolean") className += " items-center flex-row gap-2";
  else className += " flex-col";
  return (
    <div className={className}>
      <div className="flex justify-left gap-5">
        <span title={schema.title} className="text-sm">
          {schema.title}
        </span>
        {error && (
          <Hint type="danger" small>
            {error.message}
          </Hint>
        )}
      </div>
      <div className="flex items-center">
        <Argument value={value} schema={schema} setValue={setValue} />
      </div>
    </div>
  );
};

const ModelBox = ({ type, identifier, name, schema, errors, args, setArgument, close }) => (
  <div className="border border-gray-400 bg-gray-100 flex flex-col divide-y divide-gray-300">
    <div className="px-2 py-[1px] flex justify-between">
      <ModelText type={type} text={name} />
      <button onClick={close}>
        <FaTimes />
      </button>
    </div>
    {Boolean(Object.keys(schema.properties).length) && (
      <div className="px-2 py-1 flex flex-col gap-2">
        {Object.entries(schema.properties).map(([argumentName, argumentSchema]) => (
          <ArgumentLayout
            key={argumentName}
            value={args[argumentName]}
            schema={argumentSchema}
            error={errors[argumentName]}
            setValue={(v) => setArgument(identifier, argumentName, v)}
          />
        ))}
      </div>
    )}
  </div>
);
const Settings = ({ type, Context }) => {
  const { plugins, chosenModels, types, toggle, setArgument } = useContext(Context);
  const modelKeys = useMemo(() => Object.keys(plugins).sort(), [plugins]);
  const { query, setQuery, filteredKeys } = useFilter(modelKeys);

  return (
    <div>
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
        <div className="order-1">
          <LiveSearch query={query} setQuery={setQuery} />
        </div>
        <div className="order-3 sm:order-2 flex items-center">
          <HeadingMedium>Selected {type}</HeadingMedium>
        </div>
        <div className="order-2 sm:order-3">
          <SelectModels keys={filteredKeys} models={plugins} selectModel={toggle} />
        </div>
        <div className="order-4 flex flex-col gap-1 p-1 border border-slate-400 overflow-y-auto overflow-x-hidden h-[300px] shadow-md bg-white">
          {Object.entries(chosenModels).map(([key, { info, arguments: args, errors }]) => (
            <ModelBox
              key={key}
              identifier={key}
              name={plugins[key].info.name}
              args={args}
              setArgument={setArgument}
              errors={errors}
              type={info.metadata.type}
              schema={info.validators.argument}
              close={() => toggle(key)}
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
