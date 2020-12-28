import React from "react";

const Button = ({ children, size = "medium", variant = "default", className, ...other }) => {
  return (
    <button className={`uk-button uk-button-${size} uk-button-${variant} ${className ? className : ""}`} {...other}>
      {children}
    </button>
  );
};

export { Button };
