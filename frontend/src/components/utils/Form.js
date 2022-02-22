const Textarea = ({ rounded, ...props }) => (
  <textarea
    {...props}
    className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 ${
      rounded ? "rounded-lg" : ""
    } border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none`}
  />
);

const Input = ({ Icon, flatLeft, flatRight, ...props }) => (
  <div className="relative">
    {Icon && (
      <div className="absolute inset-y-0 left-0 flex items-center z-10 pl-3 pointer-events-none">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
    )}
    <input
      type="text"
      className={`${flatLeft ? "" : "rounded-l-lg"} ${
        flatRight ? "" : "rounded-r-lg"
      } focus:z-10 bg-white text-gray-900 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5 ${
        Icon ? "pl-10" : ""
      }`}
      {...props}
    />
  </div>
);

export { Textarea, Input };
