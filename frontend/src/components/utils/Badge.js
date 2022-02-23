import React from "react";
import { FaTimes } from "react-icons/fa";

const badgeStyles = {
  fill: {
    "*": "py-[6px] px-[10px]",
    primary: "bg-blue-600 text-white",
    secondary: "bg-gray-200 text-black",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-600 text-white",
    danger: "bg-red-600 text-white",
  },
  text: {
    "*": "",
    primary: "text-blue-600",
    secondary: "text-gray-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  },
};

const Badge = ({ children, appearance = "fill", variant = "primary", uppercase }) => (
  <span
    className={`${uppercase ? "uppercase" : ""} ${badgeStyles[appearance]["*"]} ${
      badgeStyles[appearance][variant]
    } whitespace-nowrap leading-none align-baseline text-xs inline-block font-bold rounded-full`}
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

const BadgeGroup = ({ children }) => <div className="flex flex-wrap gap-2">{children}</div>;

export { Badge, DismissableBadge, BadgeGroup };
