import React from "react";
import Button from "react-bootstrap/Button";
import { FaArrowAltCircleDown } from "react-icons/fa";

import { Loading } from "./Loading";

const ComputeButton = ({ className, isComputing, onClick }) => (
  <Loading className={className} isLoading={isComputing}>
    <Button
      className="d-flex justify-content-center align-items-center"
      variant="success"
      size="lg"
      onClick={onClick}
    >
      <FaArrowAltCircleDown className="mr-2" />
      Compute
    </Button>
  </Loading>
);

export { ComputeButton };
