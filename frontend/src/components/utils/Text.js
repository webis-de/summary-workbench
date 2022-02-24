import { MdDangerous, MdInfo, MdWarning } from "react-icons/md";

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

const typeToProps = {
  default: ["text-gray-500", null],
  info: ["text-blue-600", MdInfo],
  warning: ["text-yellow-600", MdWarning],
  danger: ["text-red-600", MdDangerous],
};

const Hint = ({ children, type = "default", noicon, small }) => {
  const iconClass = small ? "w-5 h-5" : "w-6 h-6";
  const wrapperClass = small ? "block w-5" : "block w-8";
  const [textColor, Icon] = typeToProps[type];
  return (
    <div className={`flex items-start gap-2 ${small ? "text-sm" : "text-base"} ${textColor}`}>
      {!noicon && Icon && (
        <div className={wrapperClass}>
          <Icon className={iconClass} />
        </div>
      )}
      <p className="tracking-tight block min-w-[20px]">{children}</p>
    </div>
  );
};

export { HeadingSemiBig, HeadingBig, HeadingSmall, HeadingMedium, Hint };
