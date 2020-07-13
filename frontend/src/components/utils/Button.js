import React from "react";

const Button = ({ onClick, children, style, size="large", variant="default" }) => {
  return (
    <button
      className={
        "uk-button uk-button-" + size + " uk-button-" + variant
      }
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
};

export { Button };
