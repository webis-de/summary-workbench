import React from "react";

const Button = ({ onClick, children, size="default", variant="default", ...other }) => {
  return (
    <button
      className={
        "uk-button uk-button-" + size + " uk-button-" + variant
      }
      onClick={onClick}
      {...other}
    >
      {children}
    </button>
  );
};

export { Button };