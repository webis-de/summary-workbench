import { useContext, useMemo } from "react";

import { SettingsContext } from "../contexts/SettingsContext";
import { computeMarkup } from "../utils/markup";

const useMarkup = (hypothese, reference) => {
  const { minOverlap } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypothese && reference) return computeMarkup([hypothese, reference], minOverlap);
    return [];
  }, [hypothese, reference, minOverlap]);
};
const useMarkups = (hypotheses, references) => {
  const { minOverlap } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypotheses && references) {
      return hypotheses.map((hypothese, index) =>
        computeMarkup([hypothese, references[index]], minOverlap)
      );
    }
    return [];
  }, [hypotheses, references, minOverlap]);
};

export { useMarkup, useMarkups };
