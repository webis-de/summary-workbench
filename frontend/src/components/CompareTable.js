import React, { useState } from "react";

import { usePagination } from "../hooks/pagination";
import { Markup } from "./utils/Markup";
import { Pagination } from "./utils/Pagination";

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
        <th>reference</th>
        <th>hypothesis</th>
      </tr>
    </thead>
    <tbody>
      {comparisons.slice((page - 1) * size, page * size).map(([index, hypothesis, reference]) => (
        <MarkupEntry key={index} row={index} hypothesis={hypothesis} reference={reference} />
      ))}
    </tbody>
  </table>
);

const CompareTable = ({ comparisons }) => {
  const [page, setPage, size, setSize, numItems] = usePagination(comparisons.length);
  const numberedComparisons = comparisons.map((el, i) => [i + 1, ...el]);

  return (
    <>
      <div
        className="uk-margin uk-grid uk-grid-small uk-child-width-1-2@s"
        style={{ gridRowGap: "10px" }}
      >
        <div>
          <input
            className="uk-input"
            type="text"
            placeholder="jump to page"
            onKeyDown={(e) => e.keyCode === 13 && setPage(e.currentTarget.value)}
          />
        </div>
        <div>
          <input
            className="uk-input"
            type="text"
            placeholder="examples per page"
            onKeyDown={(e) => e.keyCode === 13 && setSize(e.currentTarget.value)}
          />
        </div>
      </div>
      <Pagination
        activePage={page}
        size={size}
        numItems={numItems}
        pageRange={5}
        onChange={setPage}
      />
      <ComparisonDisplay page={page} size={size} comparisons={numberedComparisons} />
    </>
  );
};

export { CompareTable };
