import { del, get, post } from "./request";

const evaluateRequest = (metrics, hypdata, refdata) =>
  post("/api/evaluate", { metrics, hypdata, refdata });

export { evaluateRequest };

const saveCalculationRequest = (name, scores, comparisons) =>
  post("/api/calculations", { name, scores, comparisons });

export { saveCalculationRequest };

const getSavedCalculationsRequest = () => get("/api/calculations");

export { getSavedCalculationsRequest };

const deleteCalculationRequest = (name) => del(`/api/calculation/${encodeURIComponent(name)}`);

export { deleteCalculationRequest };

const getCalculationDataRequest = (name) => get(`/api/calculation/${encodeURIComponent(name)}`);

export { getCalculationDataRequest };

const summarizeRequest = (text, summarizers, ratio) =>
  post("/api/summarize", { text, summarizers, ratio });

export { summarizeRequest };

const feedbackRequest = (summarizer, summary, reference, url, feedback) => {
  let json = { summarizer, summary, reference, feedback };
  if (url !== null) json = { url, ...json };
  return post("/api/feedback", json);
};

export { feedbackRequest };

const saveVisualizationRequest = (visualization, auth) =>
  auth(post)("/api/visualization", visualization);

export { saveVisualizationRequest };

const getVisualizationsRequest = (auth) => auth(get)("/api/visualizations");

export { getVisualizationsRequest };

const deleteVisualizationRequest = (id, auth) => auth(del)(`/api/visualization/${id}`);

export { deleteVisualizationRequest };

const getAnnotationRequest = (id, auth) => auth(get)(`/api/visualization/${id}/annotation`);

export { getAnnotationRequest };

const updateAnnotationRequest = (id, json, auth) => auth(post)(`/api/annotation/${id}`, json);

export { updateAnnotationRequest };
