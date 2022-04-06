import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Input } from "./Form";

const parseNumber = (number) => {
  let cleanNumber = number;
  if (typeof number === "string") cleanNumber = number.replace(/\D/g, "");
  return cleanNumber ? parseInt(cleanNumber, 10) : null;
};

const InputField = ({ value: initValue, onDone }) => {
  const [value, setValue] = useState(initValue);
  const accept = () => {
    let number = parseNumber(value);
    number = number != null ? number : initValue;
    setValue(initValue);
    onDone(number);
  };
  useEffect(() => {
    setValue(initValue);
  }, [initValue, setValue]);

  return (
    <div className="w-16">
      <Input
        value={value}
        flatRight
        flatLeft
        right
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyDown={(e) => e.keyCode === 13 && accept()}
        onBlur={accept}
      />
    </div>
  );
};

const Label = ({ children }) => (
  <span className="whitespace-nowrap inline-flex items-center px-3 text-sm text-gray-900 ring-1 ring-gray-300 bg-gray-200">
    {children}
  </span>
);

const Button = ({ isLeft, isRight, disabled, onClick, children }) => {
  let className =
    "py-2 px-3 text-white font-bold text-sm disabled:bg-blue-200 disabled:cursor-default disabled:ring-blue-200 focus:z-10 ring-1 ring-blue-500 leading-tight bg-blue-500 hover:bg-blue-700 active:bg-blue-800";
  if (isLeft) className += " rounded-l-lg";
  if (isRight) className += " rounded-r-lg";

  return (
    <button className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

const Pagination = ({ numPages, page, setPage, size, setSize }) => (
  <div className="inline-flex">
    <Button isLeft disabled={page <= 1} onClick={() => setPage((old) => old - 1)}>
      Previous
    </Button>
    <InputField value={page} onDone={setPage} />
    <Label>
      / &nbsp;<span className="font-bold">{numPages}</span>&nbsp;
    </Label>
    {size !== undefined && (
      <>
        <InputField value={size} onDone={setSize} />
        <Label>items per page</Label>
      </>
    )}
    <Button isRight disabled={page >= numPages} onClick={() => setPage((old) => old + 1)}>
      Next
    </Button>
  </div>
);

const validRange = (value, maxValue, minValue = 1) => {
  let _value = value;
  if (Number.isInteger(maxValue)) _value = Math.min(maxValue, _value);
  if (Number.isInteger(minValue)) _value = Math.max(minValue, _value);
  return _value;
};

const usePagination = (
  numItems,
  { initialPage = 1, initialSize = 10, maxSize = null, reset = false }
) => {
  const [page, _setPage] = useState(initialPage);
  const [size, _setSize] = useState(initialSize);

  const numPages = useMemo(() => Math.ceil(numItems / size), [numItems, size]);

  const setPage = useCallback(
    (obj) => {
      let f = null;
      if (typeof obj === "function") f = (oldPage) => obj(oldPage);
      else f = () => obj;
      return _setPage((oldPage) => validRange(parseNumber(f(oldPage)) || oldPage, numPages));
    },
    [numPages, _setPage]
  );
  const setSize = useCallback(
    (requestSize) => {
      const newSize = validRange(parseNumber(requestSize) || size, maxSize);
      _setSize(newSize);
      _setPage(Math.ceil((size * (page - 1) + 1) / newSize));
    },
    [numItems, size, page, maxSize, _setSize]
  );

  useEffect(() => setPage(validRange(page, numPages)), [numPages, page, setPage]);
  useEffect(() => reset && setPage(initialPage), [numItems, initialPage, reset]);

  return { page, numPages, setPage, size, setSize };
};

export { Pagination, usePagination };
