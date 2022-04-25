import { Button } from "./Button";

const Textarea = ({ rounded, ...props }) => (
  <textarea
    {...props}
    className={`block p-2.5 grow w-full h-full text-sm text-gray-900 bg-white ${
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
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center z-10 pl-3 pointer-events-none">
          <Icon className={`${small ? "w-4 h-4" : "w-5 h-5"} text-gray-600`} />
        </div>
      )}
      <input
        type="text"
        {...props}
        className={`${classExtra} focus:z-10 bg-white text-gray-900 border-none ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 block min-w-0 w-full text-sm`}
      />
    </div>
  );
};

const Checkbox = ({ children, checked, onChange, onClickText }) => {
  const ChildComponent = onClickText ? (
    <Button appearance="link" onClick={onClickText}>
      {children}
    </Button>
  ) : (
    <span>{children}</span>
  );
  const Inner = (
    <>
      <input
        type="checkbox"
        className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-1 focus:ring-blue-300"
        checked={checked}
        onChange={onChange}
      />
      {ChildComponent}
    </>
  );
  const className = "inline-flex items-center justify-center whitespace-nowrap gap-2";
  if (onClickText) return <div className={className}>{Inner}</div>;
  return <label className={className}>{Inner}</label>;
};

export { Textarea, Input, Checkbox };
