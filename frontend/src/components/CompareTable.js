import React, { useContext, useState } from "react";

import { SettingsContext } from "../contexts/SettingsContext";
import { Markup } from "./utils/Markup";
import { Pagination, usePagination } from "./utils/Pagination";

const MarkupEntry = ({ row, hypothesis, reference }) => {
  const markupState = useState();
  return (
    <tr>
      <td>{row}</td>
      <td>
        <Markup markups={reference} markupState={markupState} />
      </td>
      <td>
        <Markup markups={hypothesis} markupState={markupState} />
      </td>
    </tr>
  );
};

const ComparisonDisplay = ({ page, size, comparisons }) => (
  <table className="uk-table uk-table-divider uk-table-small uk-table-middle">
    <thead>
      <tr>
        <th />
        <th>references</th>
        <th>predictions</th>
      </tr>
    </thead>
    <tbody>
      {comparisons.slice((page - 1) * size, page * size).map(([index, reference, hypothesis]) => (
        <MarkupEntry key={index} row={index} reference={reference} hypothesis={hypothesis} />
      ))}
    </tbody>
  </table>
);

const CompareTable = ({ comparisons }) => {
  const {page, setPage, size, setSize, numPages} = usePagination(comparisons.length);
  const { minOverlap } = useContext(SettingsContext);
  const numberedComparisons = comparisons.map((el, i) => [i + 1, ...el]);
  const Pages = (
    <div className="flex justify-center">
      <Pagination
        page={page}
        size={size}
        numPages={numPages}
        setPage={setPage}
        setSize={setSize}
      />
    </div>
  );

  return (
    <>
      {Pages}
      <span style={{ color: "red" }}>{`Minimum Overlap Highlighted: ${minOverlap} grams`}</span>
      <ComparisonDisplay page={page} size={size} comparisons={numberedComparisons} />
      {Pages}
    </>
  );
};

export { CompareTable };
