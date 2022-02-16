import React from "react";

const buttonStyles = {
  "*": "px-4 py-2 text-sm font-bold tracking-tight focus:z-10",
  fill: {
    "*": "focus:outline-none focus:ring transition text-white",
    primary: "bg-blue-600 hover:bg-blue-800 active:bg-blue-800 focus:ring-blue-300",
    secondary: "bg-gray-600 hover:bg-gray-800 active:bg-gray-800 focus:ring-gray-300",
    success: "bg-green-600 hover:bg-green-800 active:bg-green-800 focus:ring-green-300",
    warning: "bg-yellow-600 hover:bg-yellow-800 active:bg-yellow-800 focus:ring-yellow-300",
    danger: "bg-red-600 hover:bg-red-800 active:bg-red-800 focus:ring-red-300",
  },
  outline: {
    "*": "border focus:outline-none focus:ring transition",
    primary:
      "text-blue-600 border-blue-600 hover:text-white hover:bg-blue-600 active:bg-blue-800 focus:ring-blue-300",
    secondary:
      "text-gray-600 border-gray-600 hover:text-white hover:bg-gray-600 active:bg-gray-800 focus:ring-gray-300",
    success:
      "text-green-600 border-green-600 hover:text-white hover:bg-green-600 active:bg-green-800 focus:ring-green-300",
    warning:
      "text-yellow-600 border-yellow-600 hover:text-white hover:bg-yellow-600 active:bg-yellow-800 focus:ring-yellow-300",
    danger:
      "text-red-600 border-red-600 hover:text-white hover:bg-red-600 active:bg-red-800 focus:ring-red-300",
  },
  soft: {
    "*": "border shadow focus:outline-none focus:ring transition",
    primary:
      "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 active:bg-blue-200 focus:ring-blue-300",
    secondary:
      "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300",
    success:
      "text-green-600 bg-green-50 border-green-200 hover:bg-green-100 active:bg-green-200 focus:ring-green-300",
    warning:
      "text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 active:bg-yellow-200 focus:ring-yellow-300",
    danger:
      "text-red-600 bg-red-50 border-red-200 hover:bg-red-100 active:bg-red-200 focus:ring-red-300",
  },
  room: {
    "*": "border-b-2 focus:outline-none focus:ring transition text-white",
    primary: "bg-blue-600 border-blue-900 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-300",
    secondary:
      "bg-gray-600 border-gray-900 hover:bg-gray-700 active:bg-gray-800 focus:ring-gray-300",
    success:
      "bg-green-600 border-green-900 hover:bg-green-700 active:bg-green-800 focus:ring-green-300",
    warning:
      "bg-yellow-600 border-yellow-900 hover:bg-yellow-700 active:bg-yellow-800 focus:ring-yellow-300",
    danger: "bg-red-600 border-red-900 hover:bg-red-700 active:bg-red-800 focus:ring-red-300",
  },
  disabled: {
    "*": "cursor-default text-sm font-medium text-white",
    primary: "bg-blue-300",
    secondary: "bg-gray-300",
    success: "bg-green-300",
    warning: "bg-yellow-300",
    danger: "bg-red-300",
  },
};

const convertGroupToStyle = (group) => {
  switch (group) {
    case "first":
      return "rounded-t-md border-x border-t w-full";
    case "middle":
      return "border-x border-t w-full";
    case "last":
      return "rounded-b-md border w-full";
    default:
      return "rounded";
  }
};

const Button = ({
  appearence = "fill",
  variant = "primary",
  onClick,
  disabled,
  group,
  children,
}) => {
  const a = disabled ? "disabled" : appearence;
  const className = `${buttonStyles["*"]} ${buttonStyles[a]["*"]} ${
    buttonStyles[a][variant]
  } ${convertGroupToStyle(group)}`;
  return (
    <button className={className} disabled={a === "disabled"} onClick={onClick}>
      {children}
    </button>
  );
};

const badgeButtonStyles = {
  "*": "px-4 py-2 rounded-full text-sm font-medium font-bold tracking-tight border-0 focus:outline-none focus:ring transition text-white",
  primary: "bg-blue-600 hover:bg-blue-800 active:bg-blue-800 focus:ring-blue-300",
  secondary: "bg-gray-600 hover:bg-gray-800 active:bg-gray-800 focus:ring-gray-300",
  success: "bg-green-600 hover:bg-green-800 active:bg-green-800 focus:ring-green-300",
  warning: "bg-yellow-600 hover:bg-yellow-800 active:bg-yellow-800 focus:ring-yellow-300",
  danger: "bg-red-600 hover:bg-red-800 active:bg-red-800 focus:ring-red-300",
};

const BadgeButton = ({ variant = "primary", onClick, children }) => (
  <button onClick={onClick} className={`${badgeButtonStyles["*"]} ${badgeButtonStyles[variant]}`}>
    {children}
  </button>
);

const ButtonGroup = ({ children }) => {
  const annotations = children.map((child) => ["middle", child]);
  annotations[0][0] = "first";
  annotations[annotations.length - 1][0] = "last";
  return (
    <div>
      <div className="w-full inline-flex flex-col rounded-lg shadow-md" role="group">
        {annotations.map(([annotation, child]) =>
          React.cloneElement(child, {
            group: annotation,
          })
        )}
      </div>
    </div>
  );
};

export { Button, BadgeButton, ButtonGroup };
