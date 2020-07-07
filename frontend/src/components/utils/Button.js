import React from "react";

const Button = ({ variant, onClick, children }) => {
  return (
    <button
      className={"uk-button uk-button-large" + (variant == "" ? "" : " uk-button-" + variant)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export {Button}
