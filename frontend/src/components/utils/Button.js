import React from "react";

const Button = ({ children, size = "medium", variant = "default", className = "", ...other }) => (
  <button className={`uk-button uk-button-${size} uk-button-${variant} ${className}`} {...other}>
    {children}
  </button>
);

export { Button };
