import { get, post, wrappedFetch } from "./request";

const getMetricsRequest = () => get("/api/metrics");
const getSummarizersRequest = () => get("/api/summarizers");

const evaluateRequest = (metrics, hypotheses, references) =>
  post("/api/evaluate", { metrics, hypotheses, references });

const summarizeRequest = (text, summarizers, ratio) =>
  post("/api/summarize", { text, summarizers, ratio });

const pdfExtractRequest = async (pdf) => {
  const fd = new FormData();
  fd.append("file", pdf);

  const res = await wrappedFetch("/api/pdf/extract", {
    method: "POST",
    body: fd,
  })
  if (res.ok) return res.json();
  throw new Error(`request failed with status ${res.status}`);
};

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
};
