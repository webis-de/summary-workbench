import { useContext, useMemo } from "react";

import { SettingsContext } from "../contexts/SettingsContext";
import { computeMarkup } from "../utils/markup";

const useMarkup = (hypothese, reference) => {
  const { minOverlap, ignoreStopwords, selfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypothese && reference)
      return computeMarkup([hypothese, reference], colorMap, minOverlap, selfSimilarities, ignoreStopwords);
    return [];
  }, [hypothese, reference, minOverlap, selfSimilarities, colorMap, ignoreStopwords]);
};

const usePairwiseMarkups = (hypotheses, references) => {
  const { minOverlap, ignoreStopwords, selfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypotheses && references) {
      return hypotheses.map((hypothese, index) =>
        computeMarkup([hypothese, references[index]], colorMap, minOverlap, selfSimilarities, ignoreStopwords)
      );
    }
    return [];
  }, [hypotheses, references, minOverlap, selfSimilarities, colorMap, ignoreStopwords]);
};

const useMarkups = (texts) => {
  const { minOverlap, ignoreStopwords, selfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(
    () => computeMarkup(texts, colorMap, minOverlap, selfSimilarities, ignoreStopwords),
    [texts, minOverlap, selfSimilarities, colorMap, ignoreStopwords]
  );
};

export { useMarkup, useMarkups, usePairwiseMarkups };
