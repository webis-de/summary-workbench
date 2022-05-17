import { useContext, useMemo } from "react";
import { useAsync } from "react-use";

import { semanticRequest } from "../api";
import { SettingsContext } from "../contexts/SettingsContext";
import { computeMarkup } from "../utils/markup";

const useMarkup = (hypothese, reference, type = "lexical") => {
  const { minOverlap, ignoreStopwords, selfSimilarities, colorMap } = useContext(SettingsContext);
  let semantic = useAsync(async () => {
    if (type === "semantic" && hypothese && reference) return semanticRequest(hypothese, reference);
    return null;
  }, [hypothese, reference, type]);
  semantic = useMemo(() => {
    const { value, loading } = semantic;
    return { type: "semantic", loading, markup: value };
  }, [semantic]);
  const lexical = useMemo(() => {
    if (type === "lexical" && hypothese && reference)
      return {
        type: "lexical",
        loading: false,
        markup: computeMarkup(
          [hypothese, reference],
          colorMap,
          minOverlap,
          selfSimilarities,
          ignoreStopwords
        ),
      };
    return null;
  }, [hypothese, reference, minOverlap, selfSimilarities, colorMap, ignoreStopwords, type]);
  if (!hypothese || !reference) return null;
  if (lexical) return lexical;
  return semantic;
};

const usePairwiseMarkups = (hypotheses, references) => {
  const { minOverlap, ignoreStopwords, selfSimilarities, colorMap } = useContext(SettingsContext);
  return useMemo(() => {
    if (hypotheses && references) {
      return hypotheses.map((hypothese, index) =>
        computeMarkup(
          [hypothese, references[index]],
          colorMap,
          minOverlap,
          selfSimilarities,
          ignoreStopwords
        )
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
