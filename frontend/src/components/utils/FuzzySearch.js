import Fuse from "fuse.js";
import React, { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";

import { Input } from "./Form";

const LiveSearch = ({ query, setQuery }) => (
  <Input
    Icon={FaSearch}
    placeholder="Search"
    value={query}
    small
    onChange={(e) => setQuery(e.currentTarget.value)}
  />
);

const useFilter = (keys) => {
  const fuse = useMemo(() => new Fuse(keys), [keys]);
  const [query, setQuery] = useState("");
  const filteredKeys = useMemo(() => {
    if (!query) return keys;
    return fuse.search(query).map(({ refIndex }) => keys[refIndex]);
  }, [fuse, keys, query]);
  return { query, setQuery, filteredKeys };
};

export { useFilter, LiveSearch };
