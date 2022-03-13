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
  const cleanedKeys = useMemo(
    () => keys.map((key) => key.toLowerCase().replace(/[^a-zA-Z0-9]/, "")),
    [keys]
  );
  const fuse = useMemo(() => new Fuse(cleanedKeys), [cleanedKeys]);
  const [query, setQuery] = useState("");
  const filteredKeys = useMemo(() => {
    if (!query) return keys;
    return fuse.search(query).map(({ refIndex }) => keys[refIndex]);
  }, [fuse, keys, query]);
  return { query, setQuery, filteredKeys };
};

export { useFilter, LiveSearch };
