import React from "react";

const Loading = (props) => (
  <span data-uk-spinner {...props} />
);

const CenterLoading  = () => (
  <div style={{
      flexGrow: 1,
    }}
  ><Loading className="uk-flex uk-flex-center"
  /></div>
);

const AbsoluteLoading  = () => (
  <Loading
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }}
  />
);

export { Loading, CenterLoading, AbsoluteLoading };
