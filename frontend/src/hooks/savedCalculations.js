import { useCallback, useRef, useState } from "react";

const loadCalculationIDs = () => {
  const calculationIDs = window.localStorage.getItem("calculationIDs");
  return calculationIDs ? JSON.parse(calculationIDs) : [];
};

const saveCalculationIDs = (calculationIDs) =>
  window.localStorage.setItem("calculationIDs", JSON.stringify(calculationIDs));

const computeUnusedID = (ID, IDs) => {
  let suffix = 2;
  let newID = ID;
  while (IDs.includes(newID)) {
    newID = `${ID}-${suffix}`;
    suffix++;
  }
  return newID;
};

const saveCalculationData = (calculationID, { scores, hypotheses, references, metrics }) => {
  window.localStorage.setItem(`calculation_scores_${calculationID}`, JSON.stringify({ scores, metrics }));
  window.localStorage.setItem(
    `calculation_lines_${calculationID}`,
    JSON.stringify({ hypotheses, references })
  );
};

const deleteCalculationData = (calculationID) => {
  window.localStorage.removeItem(`calculation_scores_${calculationID}`);
  window.localStorage.removeItem(`calculation_lines_${calculationID}`);
};

const loadCalculationScores = (calculationID) =>
  JSON.parse(window.localStorage.getItem(`calculation_scores_${calculationID}`));
const loadCalculationLines = (calculationID) =>
  JSON.parse(window.localStorage.getItem(`calculation_lines_${calculationID}`));

const useSavedCalculations = () => {
  const [calculationIDs, setCalculationIDs] = useState(loadCalculationIDs);
  const calculationCache = useRef({});
  const updateCalculationIDs = useCallback(
    (newCalculationIDs) => {
      saveCalculationIDs(newCalculationIDs);
      setCalculationIDs(newCalculationIDs);
    },
    [setCalculationIDs]
  );
  const addCalculation = useCallback(
    (calculationID, data) => {
      const newCalculationID = computeUnusedID(calculationID, calculationIDs);
      saveCalculationData(newCalculationID, data);
      updateCalculationIDs([newCalculationID, ...calculationIDs]);
    },
    [updateCalculationIDs, calculationIDs]
  );
  const deleteCalculation = useCallback(
    (calculationID) => {
      updateCalculationIDs(calculationIDs.filter((ID) => ID !== calculationID));
      delete calculationCache.current[calculationID];
      deleteCalculationData(calculationID);
    },
    [updateCalculationIDs, calculationIDs]
  );
  const getCalculationScores = useCallback((calculationID) => {
    let calculation = calculationCache.current[calculationID];
    if (!calculation) calculation = {};
    let { scores } = calculation;
    console.log(calculationID)
    console.log(scores)
    if (!scores) {
      scores = loadCalculationScores(calculationID);
      calculationCache.current[calculationID] = { ...calculation, scores };
    }
    return scores;
  }, []);
  const getCalculationLines = useCallback((calculationID) => {
    let calculation = calculationCache.current[calculationID];
    if (!calculation) calculation = {};
    let { lines } = calculation;
    if (!lines) {
      lines = loadCalculationLines(calculationID);
      calculationCache.current[calculationID] = { ...calculation, lines };
    }
    return lines;
  }, []);

  return {
    calculationIDs,
    addCalculation,
    deleteCalculation,
    getCalculationScores,
    getCalculationLines,
  };
};

export { useSavedCalculations };
