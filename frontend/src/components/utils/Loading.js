import React from "react";

import { Spinner } from "./Spinner";

const Loading = ({ small, ...props }) => (
  <div className={small ? "w-[15px]" : "w-[20px]"}>
    <Spinner {...props} />
  </div>
);

const CenterLoading = (props) => (
  <div className="flex justify-center">
    <Loading {...props}  />
  </div>
);

export { Loading, CenterLoading };
