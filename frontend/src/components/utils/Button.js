import React, { useRef, useState } from "react";
import { FaCheck, FaRegCopy, FaTrash } from "react-icons/fa";

import { Loading } from "./Loading";

const buttonStyles = {
  fill: {
    "*": "focus:outline-none transition text-white",
    primary: "bg-blue-600 hover:bg-blue-800 active:bg-blue-800 focus:ring-blue-300",
    secondary: "bg-gray-600 hover:bg-gray-800 active:bg-gray-800 focus:ring-gray-300",
    success: "bg-green-600 hover:bg-green-800 active:bg-green-800 focus:ring-green-300",
    warning: "bg-yellow-600 hover:bg-yellow-800 active:bg-yellow-800 focus:ring-yellow-300",
    danger: "bg-red-600 hover:bg-red-800 active:bg-red-800 focus:ring-red-300",
  },
  outline: {
    "*": "border focus:outline-none transition",
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
    "*": "border shadow focus:outline-none transition",
    primary:
      "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 active:bg-blue-200 focus:ring-blue-300",
    secondary:
      "text-gray-600 bg-gray-50 border-gray-300 hover:bg-gray-200 active:bg-gray-200 focus:ring-gray-300",
    success:
      "text-green-600 bg-green-50 border-green-200 hover:bg-green-100 active:bg-green-200 focus:ring-green-300",
    warning:
      "text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 active:bg-yellow-200 focus:ring-yellow-300",
    danger:
      "text-red-600 bg-red-50 border-red-200 hover:bg-red-100 active:bg-red-200 focus:ring-red-300",
  },
  box: {
    "*": "border-b-2 focus:outline-none transition text-white",
    primary: "bg-blue-600 border-blue-900 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-300",
    secondary:
      "bg-gray-600 border-gray-900 hover:bg-gray-700 active:bg-gray-800 focus:ring-gray-300",
    success:
      "bg-green-600 border-green-900 hover:bg-green-700 active:bg-green-800 focus:ring-green-300",
    warning:
      "bg-yellow-600 border-yellow-900 hover:bg-yellow-700 active:bg-yellow-800 focus:ring-yellow-300",
    danger: "bg-red-600 border-red-900 hover:bg-red-700 active:bg-red-800 focus:ring-red-300",
  },
  link: {
    "*": "underline decoration-transparent hover:decoration-inherit transition duration-300 ease-in-out",
    primary: "text-blue-600 hover:text-blue-800 duration-300",
    secondary: "text-gray-600 hover:text-gray-800 duration-300",
    success: "text-green-600 hover:text-green-800 duration-300",
    warning: "text-red-600 hover:text-red-800 duration-300",
    danger: "text-yellow-600 hover:text-yellow-800 duration-300",
  },
  disabled: {
    "*": "cursor-default text-sm text-white",
    primary: "bg-blue-300",
    secondary: "bg-gray-300",
    success: "bg-green-300",
    warning: "bg-yellow-300",
    danger: "bg-red-300",
  },
};

const Button = ({
  appearance = "fill",
  variant = "primary",
  href,
  small,
  disabled,
  children,
  flatRight,
  flatLeft,
  loading,
  ...props
}) => {
  const a = disabled ? "disabled" : appearance;

  let className = "text-sm font-bold tracking-tight focus:z-10 whitespace-nowrap";

  if (appearance !== "link") className += " rounded-md";
  className += ` ${buttonStyles[a]["*"]}`;
  className += ` ${buttonStyles[a][variant]}`;

  if (flatRight) className += " rounded-r-[0]";
  if (flatLeft) className += " rounded-l-[0]";

  if (appearance !== "link") {
    if (small) className += " px-2 py-1";
    else className += " px-4 py-2";
  }
  if (!loading && appearance !== "link" && appearance !== "disabled") className += " focus:ring-2";

  const passProps = { ...props, className, disabled: a === "disabled" };

  let components = children;
  if (loading) {
    let loadingVariant = variant;
    if (appearance === "fill" || appearance === "box") loadingVariant = "white";
    components = (
      <div className="flex gap-2 items-center">
        <Loading variant={loadingVariant} small />
        {children}
      </div>
    );
  }

  if (href)
    return (
      <a href={href} {...passProps}>
        {components}
      </a>
    );
  return <button {...passProps}>{components}</button>;
};

const DeleteButton = (props) => (
  <Button {...props} appearence="box" variant="danger">
    <FaTrash className="p-[1px] w-[16px] h-[16px]" />
  </Button>
);

const LoadingButton = ({ text, ...props }) => (
  <Button {...props} loading>
    {typeof text === "string" ? text : "Loading"}...
  </Button>
);

const CopyToClipboardButton = ({ text }) => {
  const [saved, setSaved] = useState(false);
  const timeout = useRef();
  const onClick = () => {
    navigator.clipboard.writeText(text);
    setSaved(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setSaved(false), 1000);
  };
  if (saved)
    return (
      <Button variant="success">
        <FaCheck />
      </Button>
    );
  return (
    <Button appearance="fill" variant="primary" onClick={onClick}>
      <FaRegCopy />
    </Button>
  );
};

export { Button, DeleteButton, LoadingButton, CopyToClipboardButton };
