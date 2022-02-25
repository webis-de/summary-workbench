const Textarea = ({ rounded, ...props }) => (
  <textarea
    {...props}
    className={`block p-2.5 h-full w-full text-sm text-gray-900 bg-white ${
      rounded ? "rounded-lg" : ""
    } border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none`}
  />
);

const Input = ({ Icon, flatLeft, flatRight, small, right, ...props }) => {
  let classExtra = "";

  if (small) classExtra += "p-1.5";
  else classExtra += "p-2.5";

  if (!flatLeft) classExtra += " rounded-l-lg";
  if (!flatRight) classExtra += " rounded-r-lg";
  if (right) classExtra += " text-right";
  if (Icon) {
    if (small) classExtra += " pl-9";
    else classExtra += " pl-10";
  }

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center z-10 pl-3 pointer-events-none">
          <Icon className={`${small ? "w-4 h-4" : "w-5 h-5"} text-gray-600`} />
        </div>
      )}
      <input
        type="text"
        className={`${classExtra} focus:z-10 bg-white text-gray-900 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 block min-w-0 w-full text-sm`}
        {...props}
      />
    </div>
  );
};

export { Textarea, Input };
