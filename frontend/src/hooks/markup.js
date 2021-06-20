import { useContext, useMemo } from "react";

import { SettingsContext } from "../contexts/SettingsContext";
import { computeMarkup } from "../utils/markup";

const useMarkup = (hypothese, reference) => {
  const { minOverlap, allowSelfSimilarities } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypothese && reference) return computeMarkup([hypothese, reference], minOverlap, allowSelfSimilarities);
    return [];
  }, [hypothese, reference, minOverlap, allowSelfSimilarities]);
};
const useMarkups = (hypotheses, references) => {
  const { minOverlap, allowSelfSimilarities } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypotheses && references) {
      return hypotheses.map((hypothese, index) =>
        computeMarkup([hypothese, references[index]], minOverlap, allowSelfSimilarities)
      );
    }
    return [];
  }, [hypotheses, references, minOverlap, allowSelfSimilarities]);
};

export { useMarkup, useMarkups };
