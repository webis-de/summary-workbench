import React from "react";

import { Button } from "./Button";
import { Loading } from "./Loading";

const ComputeButton = ({ className, isComputing, onClick, methodCalled }) => (
  <Loading className={className} isLoading={isComputing}>
    <Button variant="primary" onClick={onClick}>
      {methodCalled}
    </Button>
  </Loading>
);

export { ComputeButton };
