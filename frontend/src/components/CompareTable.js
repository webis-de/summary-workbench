import React from "react";
import Table from "react-bootstrap/Table";

import { Markup } from "./Markup";

const CompareTable = ({ comparisons }) => {
  const thead = ["", "hypothesis", "reference"];

  return (
    <Table>
      <thead>
        <tr>
          {thead.map((cell, i) => (
            <th key={i}>{cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {comparisons.map(([number, hyp, ref]) => (
          <tr key={number}>
            <td>{number}</td>
            <td><Markup markupedText={hyp} /></td>
            <td><Markup markupedText={ref} /></td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export { CompareTable };
