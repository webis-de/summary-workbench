import { useLiveQuery } from "dexie-react-hooks";

import { initDatabase } from "../utils/saved";

const calc = initDatabase("calculation", "metrics,scores,hypotheses,references");

const useCalculations = () => {
  const calculations = useLiveQuery(calc.getAll);
  return {
    calculations,
    add: calc.add,
    del: calc.collection.delete
  };
};

export { useCalculations };
