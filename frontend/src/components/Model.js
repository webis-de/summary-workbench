import React, { useMemo } from "react";

import { usePagination } from "../hooks/pagination";
import { RGBToHex, randomColor } from "../utils/color";
import { BadgeButton } from "./utils/Button";
import { Pagination } from "./utils/Pagination";

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

const Model = ({ info, onClick, style, isSet }) => (
  <BadgeButton
    onClick={onClick}
    style={{
      border: "3px solid",
      borderRadius: "8px",
      borderColor: typeToColor(info.type),
      padding: "14px",
      color: "black",
      backgroundColor: isSet ? "#ffcccb" : "white",
      ...style,
    }}
  >
    <span title={info.name} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
      {info.name}
    </span>
  </BadgeButton>
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
  const [page, setPage, size, , numItems] = usePagination(keys.length);
  return (
    <div style={{ marginTop: "-35px" }}>
      <Legend models={models} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "50% 50%",
          marginTop: "10px",
          gridGap: "10px",
        }}
      >
        {Object.values(models).length ? (
          keys
            .slice((page - 1) * size, page * size)
            .map((key) => (
              <Model
                key={key}
                info={models[key]}
                onClick={() => selectModel(key)}
                style={{ width: "100%" }}
                isSet={settings[key]}
              />
            ))
        ) : (
          <div>no models configured</div>
        )}
      </div>
      {numItems > size && (
        <Pagination
          activePage={page}
          size={size}
          numItems={numItems}
          onChange={setPage}
          width="250px"
        />
      )}
    </div>
  );
};

export { Model, ModelGrid };
