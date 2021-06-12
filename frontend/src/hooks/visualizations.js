import { useLiveQuery } from "dexie-react-hooks";

import { initDatabase } from "../utils/saved";

const { add, put, del, getAll } = initDatabase("visualization", "documents,references,models");

const useVisualizations = () => {
  const visualizations = useLiveQuery(getAll);
  return {
    visualizations,
    addVisualization: add,
    putVisualization: put,
    deleteVisualization: del,
  };
};

export { useVisualizations };
