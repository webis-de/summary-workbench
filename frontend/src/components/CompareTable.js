import React, { useMemo, useReducer, useState, useRef } from "react";
import { Button } from "./utils/Button";

import { Markup } from "./Markup";

const defaultStart = 1;
const defaultPageSize = 1;

const ComparisonDisplay = ({ start, size, comparisons }) => (
  <table className="uk-table uk-table-divider uk-table-small uk-table-middle">
    <thead>
      <tr>
        {["", "hypothesis", "reference"].map((cell, i) => (
          <th key={i}>{cell}</th>
        ))}
      </tr>
    </thead>
    <tbody key={start + "-" + size}>
      {comparisons.slice(start - 1, start + size - 1).map(([hyp, ref], i) => (
        <tr key={i + start}>
          <td>{i + start}</td>
          <td>
            <Markup markupedText={hyp} />
          </td>
          <td>
            <Markup markupedText={ref} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);


const CompareTable = ({ comparisons }) => {
  const comparisonsLength = useMemo(() => comparisons.length, [comparisons]);
  const [pageStart, setPageStart] = useState(defaultStart);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const pageRef = useRef()
  const sizeRef = useRef()

  const updateComparisons = () => {
    const size = sizeRef.current.value.replace(/\D/g, "")
    const page = pageRef.current.value.replace(/\D/g, "")
    console.log(size)
    console.log(page)
    if (size !== "") {
        const s = Math.max(1, Math.min(comparisonsLength, parseInt(size)));
        setPageSize(s);
    }
    if (page !== "") {
        const p = Math.max(1, parseInt(page));
        setPageStart(p);
    }
  };

  const prev = () => {
    const nextStart = Math.max(1, pageStart - pageSize);
    setPageStart(nextStart);
  };

  const next = () => {
    const nextStart = Math.min(
      comparisonsLength,
      pageStart + pageSize
    );
    setPageStart(nextStart);
  };

  return (
    <>
      <div
        className="uk-margin uk-grid uk-grid-small uk-child-width-1-2@s"
        style={{ gridRowGap: "10px" }}
      >
        <div>
          <input
            ref={pageRef}
            className="uk-input"
            type="text"
            placeholder="page"
            onKeyDown={(e) => e.keyCode === 13 && updateComparisons()}
          />
        </div>
        <div>
          <input
            ref={sizeRef}
            className="uk-input"
            type="text"
            placeholder="size"
            onKeyDown={(e) => e.keyCode === 13 && updateComparisons()}
          />
        </div>
      </div>
      <div className="uk-flex uk-margin">
        <Button
          size="small"
          variant="primary"
          onClick={() => updateComparisons()}
        >
          apply
        </Button>
        <div class="uk-button-group uk-margin-left">
          <Button variant="primary" size="small" onClick={() => prev()}>
            prev
          </Button>
          <Button variant="primary" size="small" onClick={() => next()}>
            next
          </Button>
        </div>
      </div>
      <ComparisonDisplay
        start={pageStart}
        size={pageSize}
        comparisons={comparisons}
      />
    </>
  );
};

export { CompareTable };
