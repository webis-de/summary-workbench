import { FaBars, FaEye, FaEyeSlash, FaThumbsDown, FaThumbsUp } from "react-icons/fa";

const withClass =
  (WrappedComponent, classes) =>
  ({ className, ...props }) =>
    <WrappedComponent className={`${classes} ${className || ""}`} {...props} />;

const ThumbsUp = withClass(FaThumbsUp, "hover:text-green-600");
const ThumbsDown = withClass(FaThumbsDown, "hover:text-red-600");
const Bars = withClass(FaBars, "hover:text-blue-600");
const EyeOpen = withClass(FaEye, "hover:text-blue-600");
const EyeClosed = withClass(FaEyeSlash, "hover:text-blue-600");
const Eye = ({ show, ...props }) => {
  const Icon = show ? EyeOpen : EyeClosed;
  return <Icon {...props} />;
};

export { ThumbsUp, ThumbsDown, Bars, EyeOpen, EyeClosed, Eye };
