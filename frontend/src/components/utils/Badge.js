import React from "react";

const Badge = ({ children, emphasis = true }) => (
  <span
    className={`uk-badge uk-padding-small uk-margin-small-left uk-text-bold ${
      emphasis ? "uk-background-primary" : "uk-background-default uk-text-muted"
    }`}
  >
    {children}
  </span>
);

export { Badge };
