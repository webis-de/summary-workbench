import React from "react";

import { Button } from "./Button";

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
      <div className="uk-flex uk-flex-middle">
        <Button
          size="small"
          variant={activePage <= 1 ? "default" : "primary"}
          disabled={activePage <= 1}
          onClick={onClickFrom(activePage - 1)}
        >
          prev
        </Button>
      </div>
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
      <div className="uk-flex uk-flex-middle">
        <Button
          size="small"
          variant={activePage >= lastPage ? "default" : "primary"}
          disabled={activePage >= lastPage}
          onClick={onClickFrom(activePage + 1)}
        >
          next
        </Button>
      </div>
    </div>
  );
};

export { Pagination };
