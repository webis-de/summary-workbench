import React from "react";
import { Button } from "./Button";
import { FaTrash } from "react-icons/fa";

const DeleteButton = ({ onClick }) => (
  <Button
    size="small"
    variant="danger"
    onClick={onClick}
    style={{ minWidth: "50px" }}
  >
    <FaTrash />
  </Button>
);

export { DeleteButton };
