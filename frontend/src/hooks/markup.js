import { useContext, useMemo } from "react";

import { SettingsContext } from "../contexts/SettingsContext";
import { computeMarkup } from "../utils/markup";

const useMarkup = (hypothese, reference) => {
  const { minOverlap, ignoreStopwords, allowSelfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypothese && reference)
      return computeMarkup([hypothese, reference], colorMap, minOverlap, allowSelfSimilarities, ignoreStopwords);
    return [];
  }, [hypothese, reference, minOverlap, allowSelfSimilarities, colorMap, ignoreStopwords]);
};

const usePairwiseMarkups = (hypotheses, references) => {
  const { minOverlap, ignoreStopwords, allowSelfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypotheses && references) {
      return hypotheses.map((hypothese, index) =>
        computeMarkup([hypothese, references[index]], colorMap, minOverlap, allowSelfSimilarities, ignoreStopwords)
      );
    }
    return [];
  }, [hypotheses, references, minOverlap, allowSelfSimilarities, colorMap, ignoreStopwords]);
};

const useMarkups = (texts) => {
  const { minOverlap, ignoreStopwords, allowSelfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(
    () => computeMarkup(texts, colorMap, minOverlap, allowSelfSimilarities, ignoreStopwords),
    [texts, minOverlap, allowSelfSimilarities, colorMap, ignoreStopwords]
  );
};

export { useMarkup, useMarkups, usePairwiseMarkups };
