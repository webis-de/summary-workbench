import { FaBars, FaEye, FaEyeSlash, FaThumbsDown, FaThumbsUp } from "react-icons/fa";

const withClass = (WrappedComponent, classes) => ({ className, ...props }) => (
  <WrappedComponent className={`${classes} ${className || ""}`} {...props} />
);

const ThumbsUp = withClass(FaThumbsUp, "hover-green");
const ThumbsDown = withClass(FaThumbsDown, "hover-red");
const Bars = withClass(FaBars, "hover-blue");
const EyeOpen = withClass(FaEye, "hover-blue");
const EyeClosed = withClass(FaEyeSlash, "hover-blue");

export { ThumbsUp, ThumbsDown, Bars, EyeOpen, EyeClosed };
