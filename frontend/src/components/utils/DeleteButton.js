import React from "react";
import Button from "react-bootstrap/Button";
import { FaTrash } from "react-icons/fa";

const DeleteButton = ({ onClick }) => (
  <Button className="ml-3 align-self-start" variant="danger" onClick={onClick}>
    <FaTrash />
  </Button>
);

export { DeleteButton };
