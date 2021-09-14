import { get, post } from "./request";

const getMetricsRequest = () => get("/api/metrics");
const getSummarizersRequest = () => get("/api/summarizers");

const evaluateRequest = (metrics, hypotheses, references) =>
  post("/api/evaluate", { metrics, hypotheses, references });

const summarizeRequest = (text, summarizers, ratio) =>
  post("/api/summarize", { text, summarizers, ratio });

const feedbackRequest = (summarizer, summary, reference, url, feedback) => {
  let json = { summarizer, summary, reference, feedback };
  if (url !== null) json = { url, ...json };
  return post("/api/feedback", json);
};

export {
  getMetricsRequest,
  getSummarizersRequest,
  evaluateRequest,
  summarizeRequest,
  feedbackRequest,
};
