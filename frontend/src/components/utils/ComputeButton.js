import React from "react";
import { FaArrowAltCircleDown } from "react-icons/fa";

import { Loading } from "./Loading";

const ComputeButton = ({ className, isComputing, onClick }) => (
  <Loading className={className} isLoading={isComputing}>
    <button
      className="uk-button uk-button-secondary uk-button-large"
      onClick={onClick}
    >
      <FaArrowAltCircleDown className="mr-2" />
      Compute
    </button>
  </Loading>
);

export { ComputeButton };
