import React, { useCallback, useState } from "react";

const loadMinOverlap = () => parseInt(window.localStorage.getItem("min_overlap") || "3", 10);
const storeMinOverlap = (overlap) => window.localStorage.setItem("min_overlap", overlap);

const SettingsContext = React.createContext();

const SettingsProvider = ({ children }) => {
  const [minOverlap, _setMinOverlap] = useState(loadMinOverlap);
  const setMinOverlap = useCallback((overlap) => {
    const newOverlap = typeof overlap === "string" ? parseInt(overlap, 10) : overlap
    _setMinOverlap(newOverlap);
    storeMinOverlap(newOverlap);
  });
  return (
    <SettingsContext.Provider value={{ minOverlap, setMinOverlap }}>
      {children}
    </SettingsContext.Provider>
  );
};
export { SettingsContext, SettingsProvider };
