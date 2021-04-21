import { useCallback, useRef, useState } from "react";

const loadVisualizationIDs = () => {
  const visualizationIDs = window.localStorage.getItem("visualizationIDs");
  return visualizationIDs ? JSON.parse(visualizationIDs) : [];
};

const saveVisualizationIDs = (visualizationIDs) =>
  window.localStorage.setItem("visualizationIDs", JSON.stringify(visualizationIDs));

const computeUnusedID = (ID, IDs) => {
  let suffix = 2;
  let newID = ID;
  while (IDs.includes(newID)) {
    newID = `${ID}-${suffix}`;
    suffix++;
  }
  return newID;
};

const saveVisualizationData = (visualizationID, visualization) => {
  const models = visualization.models.map(({ name }) => name);
  window.localStorage.setItem(
    `visualization_data_${visualizationID}`,
    JSON.stringify(visualization)
  );
  window.localStorage.setItem(`visualization_models_${visualizationID}`, JSON.stringify(models));
};

const deleteVisualizationData = (visualizationID) => {
  window.localStorage.removeItem(`visualization_data_${visualizationID}`);
  window.localStorage.removeItem(`visualization_models_${visualizationID}`);
};

const loadVisualizationData = (visualizationID) =>
  JSON.parse(window.localStorage.getItem(`visualization_data_${visualizationID}`));

const loadVisualizationModels = (visualizationID) =>
  JSON.parse(window.localStorage.getItem(`visualization_models_${visualizationID}`));

const useSavedVisualizations = () => {
  const [visualizationIDs, setVisualizationIDs] = useState(loadVisualizationIDs);
  const visualizationCache = useRef({});
  const updateVisualizationIDs = useCallback(
    (newVisualizationIDs) => {
      saveVisualizationIDs(newVisualizationIDs);
      setVisualizationIDs(newVisualizationIDs);
    },
    [setVisualizationIDs]
  );
  const addVisualization = useCallback(
    (visualizationID, visualization, overwrite=false) => {
      const newVisualizationID = overwrite ? visualizationID : computeUnusedID(visualizationID, visualizationIDs);
      saveVisualizationData(newVisualizationID, visualization);
      delete visualizationCache.current[newVisualizationID];
      if (visualizationIDs.includes(newVisualizationID)) updateVisualizationIDs([...visualizationIDs])
      else updateVisualizationIDs([newVisualizationID, ...visualizationIDs]);
    },
    [updateVisualizationIDs, visualizationIDs]
  );
  const deleteVisualization = useCallback(
    (visualizationID) => {
      updateVisualizationIDs(visualizationIDs.filter((ID) => ID !== visualizationID));
      delete visualizationCache.current[visualizationID];
      deleteVisualizationData(visualizationID);
    },
    [updateVisualizationIDs, visualizationIDs]
  );
  const getVisualizationModels = useCallback((visualizationID) => {
    let visualization = visualizationCache.current[visualizationID];
    if (!visualization) visualization = {};
    let { models } = visualization;
    if (!models) {
      models = loadVisualizationModels(visualizationID);
      visualizationCache.current[visualizationID] = { ...visualization, models };
    }
    return models;
  }, []);
  const getVisualizationData = useCallback((visualizationID) => {
    let visualization = visualizationCache.current[visualizationID];
    if (!visualization) visualization = {};
    let { data } = visualization;
    if (!data) {
      data = loadVisualizationData(visualizationID);
      visualizationCache.current[visualizationID] = { ...visualization, data };
    }
    return data;
  }, []);

  return {
    visualizationIDs,
    addVisualization,
    deleteVisualization,
    getVisualizationModels,
    getVisualizationData,
  };
};

export { useSavedVisualizations };
