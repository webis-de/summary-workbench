const TableWrapper = ({ children }) => (
  <div className="flex flex-col">
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
      <div className="inline-block w-full align-middle divide-y divide-gray-200">{children}</div>
    </div>
  </div>
);

const Table = ({ children, fixed }) => (
  <div className="overflow-auto">
    <table className={`w-full divide-y divide-gray-200 ${fixed ? "table-fixed" : "table-auto"}`}>
      {children}
    </table>
  </div>
);

const Thead = ({ children }) => (
  <thead className="min-w-max w-full">
    <tr className="bg-gray-200 uppercase text-sm leading-normal">{children}</tr>
  </thead>
);

const Th = ({ children }) => (
  <th className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">
    {children}
  </th>
);

const Tbody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
);

const Tr = ({ children, hover, striped, red }) => {
  let className = "";

  if (red) className += "bg-red-200";
  else className += "bg-white";

  if (striped) className += " even:bg-gray-50";

  if (hover) className += " hover:bg-gray-100";

  return <tr className={className}>{children}</tr>;
};

const Td = ({ children, nowrap, center, right, strong, loose, colSpan }) => {
  let className = "text-sm font-medium";

  if (center) className += " text-center";
  else if (right) className += " text-right";
  else className += " text-left";

  if (loose) className += " p-2";
  else className += " py-4 px-6";

  if (nowrap) className += " whitespace-nowrap";

  if (strong) className += " text-gray-900";
  else className += " text-gray-500";

  return <td colSpan={colSpan} className={className}>{children}</td>;
};

export { TableWrapper, Table, Thead, Tbody, Th, Tr, Td };
