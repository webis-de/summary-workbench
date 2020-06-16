import React from "react";
import Spinner from "react-bootstrap/Spinner";

const Loading = ({ className, isLoading, children }) => {
  return (
    <div className={className}>
      {isLoading ? (
        <Spinner className="m-2" animation="border" size="lg" />
      ) : (
        <>{children}</>
      )}
    </div>
  );
};

export { Loading };
