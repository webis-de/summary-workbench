import React from "react";

const Button = ({ children, size = "medium", variant = "default", className = "", ...other }) => (
  <button className={`uk-button uk-button-${size} uk-button-${variant} ${className}`} {...other}>
    {children}
  </button>
);

const BadgeButton = ({ children, onClick, style }) => (
  <button
    onClick={onClick}
    className="uk-badge uk-text-bold"
    style={{ cursor: "pointer", ...style }}
  >
    {children}
  </button>
);

export { Button, BadgeButton };
