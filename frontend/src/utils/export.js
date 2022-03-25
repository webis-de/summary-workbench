import { range } from "./python";

const tableToStrings = (table, precision) =>
  table.map((row) => row.map((cell) => (typeof cell === "number" ? cell.toFixed(precision) : " ")));

const transposeTable = (table) =>
  range(table[0].length).map((index) => table.map((row) => row[index]));

const prepareTable = (rownames, colnames, table, transpose, precision) => {
  const stringTable = tableToStrings(table, precision);
  if (transpose) return [colnames, rownames, transposeTable(stringTable)];
  return [rownames, colnames, stringTable];
};

const latex = (rownames, colnames, table, transpose, precision) => {
  const [rnames, cnames, tab] = prepareTable(rownames, colnames, table, transpose, precision);
  return `\\begin{tabular}{l${"r".repeat(cnames.length)}}
\\toprule
{} & ${cnames.join(" & ")} \\\\
\\midrule
${rnames.map((name, i) => `\\textbf{${name}} & ${tab[i].join(" & ")} \\\\`).join("\n")}
\\bottomrule
\\end{tabular}`;
};

const csv = (rownames, colnames, table, transpose, precision) => {
  const [rnames, cnames, tab] = prepareTable(rownames, colnames, table, transpose, precision);
  return `,${cnames.join(",")}\n${rnames.map((name, i) => `${name},${tab[i].join(",")}`).join("\n")}`;
};

export default { latex, csv };
