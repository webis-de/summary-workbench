import { useLiveQuery } from "dexie-react-hooks";

import { initDatabase } from "../utils/saved";

const vis = initDatabase("visualization", "documents,models");

const useVisualizations = () => {
  const visualizations = useLiveQuery(vis.getAll);
  const create = (id, documents, models = []) => vis.add({ id, documents, models });
  const remove = (id) => vis.collection.delete(id);
  const addModel = async (id, model) => {
    const { models } = await vis.collection.get(id);
    if (models.some((m) => m.name === model.name)) return false
    models.push(model);
    await vis.collection.update(id, { models });
    return true
  };
  const delModel = async (id, modelName) => {
    let { models } = await vis.collection.get(id)
    models = models.filter(({ name }) => name !== modelName);
    return vis.collection.update(id, { models });
  };
  return { create, remove, addModel, delModel, visualizations };
};

export { useVisualizations };
