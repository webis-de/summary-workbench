import { get, post, wrappedFetch } from "./request";

const getMetricsRequest = () => get("/api/metrics");
const getSummarizersRequest = () => get("/api/summarizers");

const evaluateRequest = (metrics, references, hypotheses) =>
  post("/api/evaluate", { metrics, references, hypotheses });

const summarizeRequest = (data, summarizers, ratio) => {
  if (Array.isArray(data))
    return post("/api/summarize/bulk", { documents: data, summarizers, ratio });
  return post("/api/summarize", { text: data, summarizers, ratio });
};

const pdfExtractRequest = async (pdf) => {
  const fd = new FormData();
  fd.append("file", pdf);

  const res = await wrappedFetch("/api/pdf/extract", {
    method: "POST",
    body: fd,
  });
  if (res.ok) return res.json();
  throw new Error(`request failed with status ${res.status}`);
};

const semanticRequest = async (sentences, summary) =>
  post("/api/semantic_similarity", { sentences, summary });

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
  pdfExtractRequest,
  feedbackRequest,
  semanticRequest,
};
