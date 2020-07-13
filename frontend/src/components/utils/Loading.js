import React from "react";

const Loading = ({ isLoading, children }) => {
  return (
    <>
      {isLoading ? (
        <div className="uk-flex uk-flex-middle" data-uk-spinner/>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export { Loading };
