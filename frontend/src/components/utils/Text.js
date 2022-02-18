const HeadingSmall = ({ children }) => (
  <h5 className="text-bold capitalize text-slate-600 text-sm font-semibold">{children}</h5>
);

const HeadingMedium = ({ children }) => (
  <h4 className="text-bold capitalize text-slate-600 font-semibold">{children}</h4>
);

const HeadingSemiBig = ({ children }) => (
  <h4 className="text-xl capitalize font-semibold text-gray-900">{children}</h4>
);


const HeadingBig = ({ children }) => (
  <h3 className="text-2xl capitalize font-semibold text-gray-900">{children}</h3>
);

const Hint = ({ children }) => <span className="block text-sm text-gray-500">{children}</span>;

export { HeadingSemiBig, HeadingBig, HeadingSmall, HeadingMedium, Hint };
