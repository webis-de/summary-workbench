import React from "react";
import Spinner from "react-bootstrap/Spinner";

const Loading = ({ isLoading, children }) => {
  return (
    <>
      {isLoading ? (
        <div className="uk-flex uk-flex-middle">
          <Spinner animation="border" size="lg" />
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export { Loading };
