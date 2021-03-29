import { useReducer } from "react";

const parseNumber = (number, defaultValue) => {
  if (typeof number === "string") {
    const cleanNumber = number.replace(/\D/g, "");
    return cleanNumber ? parseInt(cleanNumber, 10) : defaultValue;
  }
  return number;
};

const usePagination = (numItems, initialPage = 1, initialSize = 10) => {
  const sizeReducer = (oldSize, newSize) =>
    Math.max(1, Math.min(numItems, parseNumber(newSize, oldSize)));
  const [size, setSize] = useReducer(sizeReducer, initialSize);

  const numPages = Math.ceil(numItems / size);
  const pageReducer = (oldPage, newPage) =>
    Math.max(1, Math.min(numPages, parseNumber(newPage, oldPage)));

  const [page, setPage] = useReducer(pageReducer, initialPage);

  return [page, setPage, size, setSize, numItems];
};

export { usePagination };
