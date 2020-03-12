import React from "react";
import Table from "react-bootstrap/Table";

const scoreInfoToArray = scoreInfo => {
  const scoreValues = Object.values(scoreInfo);
  if (scoreValues.every(v => typeof v === "number")) {
    return [Object.keys(scoreInfo), [scoreValues]];
  } else {
    const xkeys = Object.keys(scoreInfo);
    const ykeys = Object.keys(scoreInfo[xkeys[0]]);
    const head = [""].concat(xkeys);
    const body = [];
    for (const ykey of ykeys) {
      const row = [ykey];
      for (const xkey of xkeys) {
        row.push(scoreInfo[xkey][ykey]);
      }
      body.push(row);
    }
    return [head, body];
  }
};

const ScoreTable = ({ scoreInfo }) => {
  const [head, body] = scoreInfoToArray(scoreInfo);
  return (
    <Table>
      <thead>
        <tr>
          {head.map((cell, i) => (
            <th key={i}>{typeof cell === "number" ? cell.toFixed(4) : cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((row, rownum) => (
          <tr key={rownum}>
            {row.map((cell, colnum) => (
              <td key={colnum}>
                {typeof cell === "number" ? cell.toFixed(4) : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export { ScoreTable };
