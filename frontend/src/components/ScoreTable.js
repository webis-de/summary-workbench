import React from "react";

const ScoreTable = ({ scoreInfo }) => (
  <table className="uk-table uk-table-divider uk-table-small uk-table-middle">
    <thead>
      <tr>
        <th>Metric</th>
        <th>Score</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(scoreInfo)
        .sort()
        .map(([sortkey, info]) =>
          Object.entries(info).map(([metric, score]) => (
            <tr key={metric}>
              <td>{metric}</td>
              <td>{score.toFixed(3)}</td>
            </tr>
          ))
        )}
    </tbody>
  </table>
);

export { ScoreTable };
