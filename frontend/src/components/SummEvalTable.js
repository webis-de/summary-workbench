import React, { useMemo, useState } from "react";

const SummEvalTable = ({ scoreInfo }) => {
  const flatScores = useMemo(
    () => Object.values(scoreInfo).reduce((acc, value) => acc.concat(Object.entries(value)), []),
    [scoreInfo]
  );
  return (
    <div>
      <h3>SummEval</h3>
      <table className="uk-table uk-table-divider uk-table-small uk-table-middle">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {flatScores.map(([metric, score], i) => (
            <tr key={metric}>
              <td>{metric}</td>
              <td>{score.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { SummEvalTable };
