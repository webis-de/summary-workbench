import { MdDangerous, MdInfo, MdWarning } from "react-icons/md";

const HeadingSmall = ({ children, raw }) => (
  <h4 className={`text-bold ${raw ? "" : "capitalize"} text-slate-600 text-sm font-semibold`}>{children}</h4>
);

const HeadingMedium = ({ children, raw }) => (
  <h3 className={`text-bold ${raw ? "" : "capitalize"} text-slate-600 font-semibold`}>{children}</h3>
);

const HeadingSemiBig = ({ children, raw }) => (
  <h2 className={`text-xl ${raw ? "" : "capitalize"} font-semibold text-gray-900`}>{children}</h2>
);

const HeadingBig = ({ children, raw }) => (
  <h1 className={`text-2xl ${raw ? "" : "capitalize"} font-semibold text-gray-900`}>{children}</h1>
);

const typeToProps = {
  default: ["text-gray-500", null],
  info: ["text-blue-600", MdInfo],
  warning: ["text-yellow-600", MdWarning],
  danger: ["text-red-600", MdDangerous],
};

const Hint = ({ children, type = "default", noicon, small }) => {
  const iconClass = small ? "w-[20px] h-[20px]" : "w-[25px] h-[25px]";
  const wrapperClass = small ? "block min-w-[20px]" : "block min-w-[25px]";
  const [textColor, Icon] = typeToProps[type];
  return (
    <div className={`flex items-start gap-2 ${small ? "text-sm" : "text-base"} ${textColor}`}>
      {!noicon && Icon && (
        <div className={wrapperClass}>
          <Icon className={iconClass} />
        </div>
      )}
      <p className="tracking-tight block">{children}</p>
    </div>
  );
};

const Label = ({ text, children }) => (
  <label className="w-full flex flex-col gap-1 text-sm font-medium text-gray-900 capitalize">
    {text}
    {children}
  </label>
);

export { HeadingSemiBig, HeadingBig, HeadingSmall, HeadingMedium, Hint, Label };
