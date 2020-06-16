import React from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { FaCloud } from "react-icons/fa";

const ToggleSavedButton = ({ onClick, numberCalculations }) => (
  <Button variant="info" onClick={onClick}>
    <FaCloud /> saved calculations{" "}
    <Badge variant="light" pill>
      {numberCalculations}
    </Badge>
  </Button>
);

export { ToggleSavedButton };
