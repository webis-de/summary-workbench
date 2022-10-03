import { get, post, wrappedFetch } from "./request";

const getMetricsRequest = () => get("/api/metrics");
const getSummarizersRequest = () => get("/api/summarizers");

const evaluateRequest = (metrics, references, hypotheses, abortController) =>
  post("/api/evaluate", { metrics, references, hypotheses }, { abortController });

const summarizeRequest = (documents, summarizers, ratio, bulk, abortController) => {
  const data = { documents, summarizers, ratio, add_metadata: true };
  if (!bulk) {
    data.split_sentences = true;
  }
  return post("/api/summarize", data, { abortController });
};

const pdfExtractRequest = async (pdf) => {
  const res = await wrappedFetch("/api/pdf/extract", {
    method: "POST",
    body: pdf,
  });
  if (res.ok) {
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }
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
