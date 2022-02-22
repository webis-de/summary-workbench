import React, { useMemo } from "react";

import { RGBToHex, randomColor } from "../utils/color";
import { Pagination, usePagination } from "./utils/Pagination";

const typeToColor = (type) => {
  switch (type) {
    case "lexical":
      return "blue";
    case "semantic":
      return "green";
    case "extractive":
      return "blue";
    case "abstractive":
      return "green";
    default:
      return RGBToHex(randomColor());
  }
};

const Model = ({ info, onClick, isSet }) => (
  <button
    onClick={onClick}
    className="border-2 border-lg p-2"
    style={{
      borderColor: typeToColor(info.type),
      backgroundColor: isSet ? "#ffcccb" : "white",
    }}
  >
    <span title={info.name} className="block overflow-hidden text-ellipsis">
      {info.name}
    </span>
  </button>
);

const Legend = ({ models }) => {
  const types = useMemo(
    () =>
      [...new Set(Object.values(models).map(({ type }) => type))].map((type) => [
        type,
        typeToColor(type),
      ]),
    [models]
  );
  return (
    <div className="uk-flex" style={{ gap: "15px" }}>
      {types.map(([type, color]) => (
        <div key={type} className="uk-flex" style={{ alignItems: "center", whiteSpace: "nowrap" }}>
          <div
            style={{
              display: "inline-block",
              padding: "3px",
              marginRight: "5px",
              backgroundColor: color,
            }}
          />
          {type}
        </div>
      ))}
    </div>
  );
};

const ModelGrid = ({ keys, models, settings, selectModel }) => {
  const { numPages, page, setPage, size, setSize } = usePagination(keys.length);
  return (
    <div>
      <Legend models={models} />
      <div className="grid grid-cols-2 gap-4">
        {Object.values(models).length ? (
          keys
            .slice((page - 1) * size, page * size)
            .map((key) => (
              <Model
                key={key}
                info={models[key]}
                onClick={() => selectModel(key)}
                isSet={settings[key]}
              />
            ))
        ) : (
          <div>no models configured</div>
        )}
      </div>
      <Pagination page={page} size={size} numPages={numPages} setPage={setPage} setSize={setSize} />
    </div>
  );
};

export { Model, ModelGrid };
