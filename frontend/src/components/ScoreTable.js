import React from "react";
import Table from "react-bootstrap/Table";

const ScoreTable = ({ scoreInfo }) => (
  <Table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Score</th>
      </tr>
    </thead>
    <tbody>
      {Object.values(scoreInfo).map((info) =>
        Object.entries(info).map(([metric, score]) => (
          <tr key={metric}>
            <td>{metric}</td>
            <td>{score.toFixed(3)}</td>
          </tr>
        ))
      )}
    </tbody>
  </Table>
);

export { ScoreTable };
