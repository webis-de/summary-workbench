import { useContext, useMemo } from "react";

import { SettingsContext } from "../contexts/SettingsContext";
import { computeMarkup } from "../utils/markup";

const useMarkup = (hypothese, reference) => {
  const { minOverlap, allowSelfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypothese && reference)
      return computeMarkup([hypothese, reference], colorMap, minOverlap, allowSelfSimilarities);
    return [];
  }, [hypothese, reference, minOverlap, allowSelfSimilarities, colorMap]);
};

const usePairwiseMarkups = (hypotheses, references) => {
  const { minOverlap, allowSelfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypotheses && references) {
      return hypotheses.map((hypothese, index) =>
        computeMarkup([hypothese, references[index]], colorMap, minOverlap, allowSelfSimilarities)
      );
    }
    return [];
  }, [hypotheses, references, minOverlap, allowSelfSimilarities, colorMap]);
};

const useMarkups = (texts) => {
  const { minOverlap, allowSelfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(
    () => computeMarkup(texts, colorMap, minOverlap, allowSelfSimilarities),
    [texts, minOverlap, allowSelfSimilarities, colorMap]
  );
};

export { useMarkup, useMarkups, usePairwiseMarkups };
