import { useLiveQuery } from "dexie-react-hooks";

import { initDatabase } from "../utils/saved";

const { add, del, getAll } = initDatabase("calculation", "metrics,scores,hypotheses,references");

const useCalculations = () => {
  const calculations = useLiveQuery(getAll);
  return {
    calculations,
    addCalculation: add,
    deleteCalculation: del,
  };
};

export { useCalculations };
