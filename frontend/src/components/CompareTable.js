import React, { useEffect, useReducer } from "react";

import { Markup } from "./Markup";

const ComparisonDisplay = ({ page, size, comparisons }) => {
  return (
    <table className="uk-table uk-table-divider uk-table-small uk-table-middle">
      <thead>
        <tr>
          <th />
          <th>hypothesis</th>
          <th>reference</th>
        </tr>
      </thead>
      <tbody>
        {comparisons.slice((page - 1) * size, page * size).map(([index, hyp, ref]) => (
          <tr key={index}>
            <td>{index}</td>
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
};

const parseNumber = (number, defaultValue) => {
  if (typeof number === "string") {
    const cleanNumber = number.replace(/\D/g, "");
    return cleanNumber ? parseInt(cleanNumber, 10) : defaultValue;
  }
  return number;
};

const usePagination = (numItems, initialPage = 1, initialSize = 10) => {
  const sizeReducer = (oldSize, newSize) => {
    return Math.max(1, Math.min(numItems, parseNumber(newSize, oldSize)));
  };
  const [size, setSize] = useReducer(sizeReducer, initialSize);

  const numPages = Math.ceil(numItems / size);
  const pageReducer = (oldPage, newPage) => {
    return Math.max(1, Math.min(numPages, parseNumber(newPage, oldPage)));
  };

  const [page, setPage] = useReducer(pageReducer, initialPage);

  useEffect(() => setPage(initialPage), [size, initialPage]);

  return [page, setPage, size, setSize, numItems];
};

const range = (from, to) => {
  const size = to - from;
  return size > 0 ? [...Array(size).keys(size)].map((i) => from + i) : [];
};

const PaginationBefore = ({ activePage, itemsBefore, onClickFrom }) => {
  const before = range(Math.max(1, activePage - itemsBefore), activePage);
  if (before.length) {
    return (
      <>
        {before[0] !== 1 && (
          <li>
            <a href="/#" onClick={onClickFrom(1)}>
              1
            </a>
          </li>
        )}
        {before[0] > 2 && (
          <li className="uk-disabled">
            <span>...</span>
          </li>
        )}
        {before.map((el) => (
          <li key={el}>
            <a href="/#" onClick={onClickFrom(el)}>
              {el}
            </a>
          </li>
        ))}
      </>
    );
  }
  return null;
};

const PaginationAfter = ({ activePage, lastPage, itemsAfter, onClickFrom }) => {
  const after = range(activePage + 1, Math.min(activePage + itemsAfter, lastPage) + 1);

  if (after.length) {
    return (
      <>
        {after.map((el) => (
          <li key={el}>
            <a href="/#" onClick={onClickFrom(el)}>
              {el}
            </a>
          </li>
        ))}
        {after[after.length - 1] < lastPage - 1 && (
          <li className="uk-disabled">
            <span>...</span>
          </li>
        )}
        {after[after.length - 1] !== lastPage && (
          <li>
            <a href="/#" onClick={onClickFrom(lastPage)}>
              {lastPage}
            </a>
          </li>
        )}
      </>
    );
  }
  return null;
};

const Pagination = ({ activePage, size, numItems, onChange, pageRange = 5 }) => {
  const itemsLeftRight = Math.floor(pageRange / 2);
  const lastPage = Math.ceil(numItems / size);
  const onClickFrom = (el) => (e) => {
    e.preventDefault();
    onChange(el);
  };
  return (
    <div className="uk-flex uk-flex-center">
      {activePage > 1 ? (
        <a className="uk-flex uk-flex-center" href="/#" onClick={onClickFrom(activePage - 1)}>
          <span className="uk-flex uk-flex-center" data-uk-pagination-previous />
        </a>
      ) : (
        <span className="uk-flex uk-flex-center" data-uk-pagination-previous />
      )}
      <ul className="uk-pagination uk-flex-center" uk-margin style={{ width: "400px" }}>
        <PaginationBefore
          activePage={activePage}
          itemsBefore={itemsLeftRight}
          onClickFrom={onClickFrom}
        />
        <li className="uk-active">
          <span className="foreground">{activePage}</span>
        </li>
        <PaginationAfter
          activePage={activePage}
          lastPage={lastPage}
          itemsAfter={itemsLeftRight}
          onClickFrom={onClickFrom}
        />
      </ul>
      {activePage < lastPage ? (
        <a href="/#" className="uk-flex uk-flex-center" onClick={onClickFrom(activePage + 1)}>
          <span className="uk-flex uk-flex-center" data-uk-pagination-next />
        </a>
      ) : (
        <span className="uk-flex uk-flex-center" data-uk-pagination-next />
      )}
    </div>
  );
};

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
            placeholder="page"
            onKeyDown={(e) => e.keyCode === 13 && setPage(e.target.value)}
          />
        </div>
        <div>
          <input
            className="uk-input"
            type="text"
            placeholder="size"
            onKeyDown={(e) => e.keyCode === 13 && setSize(e.target.value)}
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
