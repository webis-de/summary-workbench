const TableWrapper = ({ children }) => (
  <div className="flex flex-col">
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
      <div className="inline-block w-full align-middle divide-y divide-gray-200">{children}</div>
    </div>
  </div>
);

const Table = ({ children, fixed }) => (
  <div className="overflow-auto">
    <table className={`w-full divide-y divide-gray-200 ${fixed ? "table-fxed" : "table-auto"}`}>
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

const Tr = ({ children, hover, striped }) => (
  <tr
    className={`bg-white ${striped ? "even:bg-gray-50" : ""} ${hover ? "hover:bg-gray-100" : ""}`}
  >
    {children}
  </tr>
);

const Td = ({ children, nowrap, center, right, strong, loose }) => {
  let direction = "text-left";
  if (center) direction = "text-center";
  else if (right) direction = "text-right";

  let padding = "py-4 px-6";
  if (loose) padding = "p-2";

  return (
    <td
      className={`${padding} text-sm font-medium ${
        strong ? "text-gray-900" : "text-gray-500"
      } ${direction} ${nowrap ? "whitespace-nowrap" : ""}`}
    >
      {children}
    </td>
  );
};

export { TableWrapper, Table, Thead, Tbody, Th, Tr, Td };
