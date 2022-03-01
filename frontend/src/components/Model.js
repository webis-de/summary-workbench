import React, { useMemo } from "react";
import { FaCheck } from "react-icons/fa";

import { cyrb53 } from "../utils/color";
import { Pagination, usePagination } from "./utils/Pagination";

const colors = ["bg-red-400", "bg-blue-400"];

const typeToColor = (type) => {
  switch (type) {
    case "lexical":
      return colors[0];
    case "semantic":
      return colors[1];
    case "extractive":
      return colors[0];
    case "abstractive":
      return colors[1];
    default:
      return colors[cyrb53(type || "") % colors.length];
  }
};

const Bullet = ({ color }) => (
  <div
    className={`block min-w-[10px] min-h-[10px] shadow-gray-300 shadow-lg rounded-full ${color}`}
  />
);

const ModelText = ({ type, text }) => (
  <div className="flex items-center gap-2">
    <Bullet color={typeToColor(type)} />
    <span title={text} className="block overflow-hidden text-ellipsis">
      {text}
    </span>
  </div>
);

const Model = ({ info, onClick, isSet }) => (
  <button
    className="ring-1 ring-slate-300 flex items-center gap-2 px-2 py-1 bg-white hover:bg-slate-200"
    onClick={onClick}
  >
    <FaCheck className={`text-green-600 ${isSet ? "" : "invisible"}`} />
    <ModelText type={info.type} text={info.name} />
  </button>
);

const Legend = ({ types }) => (
  <div className="flex flex-wrap gap-2 text-slate-600">
    {types.map((type) => (
      <div key={type} className="flex gap-2 items-center whitespace-nowrap text-sm">
        <div className="flex items-center gap-1">
          <Bullet color={typeToColor(type)} />
          {type}
        </div>
      </div>
    ))}
  </div>
);
export { Model, Legend, ModelText };
