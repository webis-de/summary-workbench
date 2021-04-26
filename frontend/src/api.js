import { del, get, post } from "./request";

const evaluateRequest = (metrics, hypdata, refdata) =>
  post("/api/evaluate", { metrics, hypdata, refdata });

export { evaluateRequest };

const saveCalculationRequest = (name, scores, comparisons) =>
  post("/api/calculations", { name, scores, comparisons });

export { saveCalculationRequest };

const summarizeRequest = (text, summarizers, ratio) =>
  post("/api/summarize", { text, summarizers, ratio });

export { summarizeRequest };

const feedbackRequest = (summarizer, summary, reference, url, feedback) => {
  let json = { summarizer, summary, reference, feedback };
  if (url !== null) json = { url, ...json };
  return post("/api/feedback", json);
};

export { feedbackRequest };
