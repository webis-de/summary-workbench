import React from "react";
import { FaTimes } from "react-icons/fa";

const Badge = ({ children, emphasis = true }) => (
  <span
    className={`uk-badge uk-padding-small uk-margin-small-left uk-text-bold ${
      emphasis ? "uk-background-primary" : "uk-background-default uk-text-muted"
    }`}
    style={{ whiteSpace: "nowrap" }}
  >
    {children}
  </span>
);

const DismissableBadge = ({ children, style, onClick }) => (
  <span
    className="uk-badge uk-text-bold uk-flex"
    style={{
      alignItems: "center",
      padding: "10px",
      paddingRight: "6px",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
    <a
      href="/#"
      style={{ display: "flex", marginLeft: "3px" }}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
      }}
    >
      <FaTimes style={{ minWidth: "15px", color: "black" }} />
    </a>
  </span>
);

export { Badge, DismissableBadge };
