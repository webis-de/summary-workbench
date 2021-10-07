import React, { useState, useContext } from "react";
import {SettingsContext} from "../contexts/SettingsContext"

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
  const [page, setPage, size, setSize, numItems] = usePagination(comparisons.length);
  const { minOverlap } = useContext(SettingsContext)
  const numberedComparisons = comparisons.map((el, i) => [i + 1, ...el]);

  return (
    <>
      <Pagination
        activePage={page}
        size={size}
        numItems={numItems}
        pageRange={5}
        onChange={setPage}
      />
      <div className="uk-flex uk-flex-between">
      <span style={{color: "red"}}>{`Minimum Overlap Highlighted: ${minOverlap} grams`}</span>
        <div className="uk-flex">
        <div>
          <input
            className="uk-input align-center"
            type="text"
            placeholder="jump to page"
            onKeyDown={(e) => e.keyCode === 13 && setPage(e.currentTarget.value)}
          />
        </div>
        <div>
          <input
            className="uk-input align-center"
            type="text"
            placeholder="examples per page"
            onKeyDown={(e) => e.keyCode === 13 && setSize(e.currentTarget.value)}
          />
        </div>
        </div>
      </div>
      <ComparisonDisplay page={page} size={size} comparisons={numberedComparisons} />
    </>
  );
};

export { CompareTable };
