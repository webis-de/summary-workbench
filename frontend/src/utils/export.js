const transformScores = (scores, precision) => {
  scores.sort();
  const names = scores.map((row) => row[0]);
  const values = scores.map((row) => row[1].toFixed(precision));
  return [names, values];
};

const latex = (scores, transpose, precision) => {
  const [names, values] = transformScores(scores, precision);
  if (transpose) {
    return `\\begin{tabular}{l${"r".repeat(scores.length)}}
\\toprule
{} & ${names.join(" & ")} \\\\
\\midrule
\\textbf{score} & ${values.join(" & ")} \\\\
\\bottomrule
\\end{tabular}`;
  }
  return `\\begin{tabular}{lr}
\\toprule
{} & score \\\\
\\midrule
${names.map((name, i) => `\\textbf{${name}} & ${values[i]} \\\\`).join("\n")}
\\bottomrule
\\end{tabular}`;
};

const csv = (scores, transpose, precision) => {
  const [names, values] = transformScores(scores, precision);
  if (transpose) return `${names.join(",")}\n${values.join(",")}`;
  return `metric,score\n${names.map((name, i) => `${name},${values[i]}`).join("\n")}`;
};

export default { latex, csv };
