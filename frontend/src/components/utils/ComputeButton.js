import React from "react";
import { FaArrowAltCircleDown } from "react-icons/fa";

import { Button } from "./Button";
import { Loading } from "./Loading";

const ComputeButton = ({ className, isComputing, onClick }) => (
  <Loading className={className} isLoading={isComputing}>
    <Button variant="secondary" onClick={onClick}>
      <FaArrowAltCircleDown className="uk-margin-right" />
      Compute
    </Button>
  </Loading>
);

export { ComputeButton };
