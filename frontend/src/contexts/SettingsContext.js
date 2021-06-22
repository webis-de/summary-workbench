import React, { useCallback, useState } from "react";

const loadMinOverlap = () => parseInt(window.localStorage.getItem("min_overlap") || "3", 10);
const storeMinOverlap = (overlap) => window.localStorage.setItem("min_overlap", overlap);
const loadAllowSelfSimilarities = () => window.localStorage.getItem("allow_self_similarities") === "true"
const storeAllowSelfSimilarities = (allowSelfSimilarities) => window.localStorage.setItem("allow_self_similarities", allowSelfSimilarities);

const SettingsContext = React.createContext();

const SettingsProvider = ({ children }) => {
  const [allowSelfSimilarities, setAllowSelfSimilarities] = useState(loadAllowSelfSimilarities)
  const [minOverlap, _setMinOverlap] = useState(loadMinOverlap);
  const toggleAllowSelfSimilarities = useCallback(() => {
    const newValue = !allowSelfSimilarities
    setAllowSelfSimilarities(newValue);
    storeAllowSelfSimilarities(newValue);
  }, [allowSelfSimilarities, setAllowSelfSimilarities]);
  const setMinOverlap = useCallback((overlap) => {
    const newOverlap = typeof overlap === "string" ? parseInt(overlap, 10) : overlap
    _setMinOverlap(newOverlap);
    storeMinOverlap(newOverlap);
  }, [_setMinOverlap]);
  return (
    <SettingsContext.Provider value={{ minOverlap, setMinOverlap, allowSelfSimilarities, toggleAllowSelfSimilarities }}>
      {children}
    </SettingsContext.Provider>
  );
};
export { SettingsContext, SettingsProvider };
