import React from "react";

const Loading = ({ isLoading, children }) => {
  return (
    <>
      {isLoading ? (
        <div data-uk-spinner/>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export { Loading };
