import React from "react";
import { FaTimes } from "react-icons/fa";

const badgeStyles = {
  "*": "",
  primary: "bg-blue-600 text-white",
  secondary: "bg-gray-200 text-black",
  success: "bg-green-600 text-white",
  warning: "bg-yellow-600 text-white",
  danger: "bg-red-600 text-white",
};

const Badge = ({ children, variant = "primary" }) => (
  <span
    className={`py-2 px-3 whitespace-nowrap leading-none align-baseline text-xs inline-block font-bold rounded-full ${badgeStyles[variant]}`}
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
