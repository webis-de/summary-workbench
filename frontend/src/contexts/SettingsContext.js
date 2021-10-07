import React, { useCallback, useReducer, useState } from "react";

import { ColorMap } from "../utils/color";

const loadColorscheme = () => window.localStorage.getItem("colorscheme") || "soft";
const storeColorscheme = (colorscheme) => window.localStorage.setItem("colorscheme", colorscheme);

const loadMinOverlap = () => parseInt(window.localStorage.getItem("min_overlap") || "3", 10);
const storeMinOverlap = (overlap) => window.localStorage.setItem("min_overlap", overlap);

const loadSummaryLength = () => window.localStorage.getItem("summary_length") || "15";
const storeSummaryLength = (summaryLength) =>
  window.localStorage.setItem("summary_length", summaryLength);

const loadAllowSelfSimilarities = () =>
  window.localStorage.getItem("allow_self_similarities") === "true";
const storeAllowSelfSimilarities = (allowSelfSimilarities) =>
  window.localStorage.setItem("allow_self_similarities", allowSelfSimilarities);

const loadIgnoreStopwords = () =>
  window.localStorage.getItem("ignore_stopwords") === "true";
const storeIgnoreStopwords = (ignoreStopwords) =>
  window.localStorage.setItem("ignore_stopwords", ignoreStopwords);

const SettingsContext = React.createContext();

const SettingsProvider = ({ children }) => {
  const [allowSelfSimilarities, setAllowSelfSimilarities] = useState(loadAllowSelfSimilarities);
  const [ignoreStopwords, setIgnoreStopwords] = useState(loadIgnoreStopwords);
  const [minOverlap, setMinOverlap] = useReducer((_, overlap) => {
    const newOverlap = typeof overlap === "string" ? parseInt(overlap, 10) : overlap;
    storeMinOverlap(newOverlap);
    return newOverlap;
  }, loadMinOverlap());
  const [summaryLength, setSummaryLength] = useReducer((_, newSummaryLength) => {
    storeSummaryLength(newSummaryLength);
    return newSummaryLength;
  }, loadSummaryLength());
  const [colorMap, setColorMap] = useReducer((oldColorMap, colorscheme) => {
    try {
      const newColorMap = new ColorMap(colorscheme);
      storeColorscheme(colorscheme);
      return newColorMap;
    } catch (err) {
      return oldColorMap;
    }
  }, new ColorMap(loadColorscheme(), true));
  const toggleIgnoreStopwords = useCallback(() => {
    const newValue = !ignoreStopwords;
    setIgnoreStopwords(newValue);
    storeIgnoreStopwords(newValue);
  }, [ignoreStopwords, setIgnoreStopwords]);
  const toggleAllowSelfSimilarities = useCallback(() => {
    const newValue = !allowSelfSimilarities;
    setAllowSelfSimilarities(newValue);
    storeAllowSelfSimilarities(newValue);
  }, [allowSelfSimilarities, setAllowSelfSimilarities]);
  return (
    <SettingsContext.Provider
      value={{
        minOverlap,
        ignoreStopwords,
        toggleIgnoreStopwords,
        setMinOverlap,
        allowSelfSimilarities,
        toggleAllowSelfSimilarities,
        colorMap,
        setColorMap,
        summaryLength,
        setSummaryLength,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
export { SettingsContext, SettingsProvider };
