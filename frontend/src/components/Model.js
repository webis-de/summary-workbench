import React from "react";

import { textToColor } from "../utils/color";
import { BadgeButton } from "./utils/Button";

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
      return textToColor(type)[0];
  }
};

const Model = ({ info, onClick, isSet }) => (
  <BadgeButton
    onClick={onClick}
    style={{
      border: "3px solid",
      borderRadius: "8px",
      borderColor: typeToColor(info.type),
      padding: "14px",
      color: "black",
      backgroundColor: isSet ? "#ffcccb" : "white",
    }}
  >
    {info.name}
  </BadgeButton>
);

export { Model };
