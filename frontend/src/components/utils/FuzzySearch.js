import Fuse from "fuse.js";
import React, { useMemo, useState } from "react";

const LiveSearch = ({ query, setQuery }) => (
  <input
    className="uk-input"
    placeholder="Search"
    type="text"
    onChange={(e) => setQuery(e.currentTarget.value)}
  />
);

const useFilter = (keys) => {
  const cleanedKeys = useMemo(() =>
    keys.map((key) => key.toLowerCase().replace(/[^a-zA-Z0-9]/, ""))
  );
  const fuse = useMemo(() => new Fuse(cleanedKeys), [cleanedKeys]);
  const [query, setQuery] = useState("");
  const filteredKeys = useMemo(() => {
    if (!query) return keys;
    return fuse.search(query).map(({ refIndex }) => keys[refIndex]);
  }, [keys, query]);
  return { query, setQuery, filteredKeys };
};

export { useFilter, LiveSearch };
