import React from "react";
import { FaTrash } from "react-icons/fa";

import { Button } from "./Button";

const DeleteButton = ({ style, ...other }) => (
  <Button size="small" variant="danger" style={{ minWidth: "50px", ...style }} {...other}>
    <FaTrash />
  </Button>
);

export { DeleteButton };
