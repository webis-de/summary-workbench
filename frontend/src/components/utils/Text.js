import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { MdDangerous } from "react-icons/md";

const HeadingSmall = ({ children }) => (
  <h4 className="text-bold capitalize text-slate-600 text-sm font-semibold">{children}</h4>
);

const HeadingMedium = ({ children }) => (
  <h3 className="text-bold capitalize text-slate-600 font-semibold">{children}</h3>
);

const HeadingSemiBig = ({ children }) => (
  <h2 className="text-xl capitalize font-semibold text-gray-900">{children}</h2>
);

const HeadingBig = ({ children }) => (
  <h1 className="text-2xl capitalize font-semibold text-gray-900">{children}</h1>
);

const iconClass = "text-xl";
const typeToProps = {
  default: ["text-gray-500", null],
  info: ["text-blue-600", <FaInfoCircle className={iconClass} key={1} />],
  warn: ["text-yellow-600", <FaExclamationTriangle className={iconClass} key={2} />],
  danger: ["text-red-600", <MdDangerous className={iconClass} key={3} />],
};

const Hint = ({ children, type = "default", noicon, small }) => {
  const [textColor, icon] = typeToProps[type];
  return (
    <div className={`flex items-start gap-2 ${small ? "text-sm" : "text-base"} ${textColor}`}>
      {icon && !noicon && <div className="min-w-[20px]">{icon}</div>} {children}
    </div>
  );
};

export { HeadingSemiBig, HeadingBig, HeadingSmall, HeadingMedium, Hint };
