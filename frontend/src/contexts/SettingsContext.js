import React, { useMemo } from "react";
import { useLocalStorage } from "react-use";

import { ColorMap } from "../utils/color";

const SettingsContext = React.createContext();

const SettingsProvider = ({ children }) => {
  const [selfSimilarities, setSelfSimilarities] = useLocalStorage("allow-self-similarities", false);
  const [ignoreStopwords, setIgnoreStopwords] = useLocalStorage("ignore-stopwords", true);
  const [minOverlap, setMinOverlap] = useLocalStorage("min-overlap", 3);
  const [summaryLength, setSummaryLength] = useLocalStorage("summary-length", 15);
  const [colorscheme, setColorscheme] = useLocalStorage("colorscheme", "soft");

  const colorMap = useMemo(() => new ColorMap(colorscheme, true), [colorscheme]);

  const value = useMemo(
    () => ({
      minOverlap,
      setMinOverlap,
      ignoreStopwords,
      setIgnoreStopwords,
      selfSimilarities,
      setSelfSimilarities,
      colorMap,
      setColorscheme,
      summaryLength,
      setSummaryLength,
    }),
    [
      minOverlap,
      ignoreStopwords,
      setIgnoreStopwords,
      setMinOverlap,
      selfSimilarities,
      setSelfSimilarities,
      colorMap,
      setColorscheme,
      summaryLength,
      setSummaryLength,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
export { SettingsContext, SettingsProvider };
