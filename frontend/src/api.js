const DEVELOP = process.env.REACT_APP_DEVELOP;
let baseName = "";
if (DEVELOP === "true") {
  const HOST = process.env.REACT_APP_API_HOST || "localhost";
  const PORT = process.env.REACT_APP_API_PORT || "5000";
  baseName = `http://${HOST}:${PORT}`;
  console.log(baseName);
}

const evaluateRequest = (metrics, hypdata, refdata) => {
  const method = "POST";
  const body = JSON.stringify({ metrics, hypdata, refdata });
  return fetch(`${baseName}/api/evaluate`, {
    method,
    body,
    headers: { "Content-Type": "application/json" },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error("response not ok");
  });
};

export { evaluateRequest };

const saveCalculationRequest = (name, scores, comparisons) => {
  const method = "POST";
  const body = JSON.stringify({ name, scores, comparisons });
  const headers = { "Content-Type": "application/json" };
  return fetch(`${baseName}/api/calculations`, {
    method,
    body,
    headers,
  }).then((response) => {
    if (!response.ok) {
      throw new Error("upload error");
    }
  });
};

export { saveCalculationRequest };

const getSavedCalculationsRequest = () => {
  const method = "GET";
  return fetch(`${baseName}/api/calculations`, {
    method,
  }).then((response) => response.json());
};

export { getSavedCalculationsRequest };

const deleteCalculationRequest = (name) => {
  const method = "DELETE";
  return fetch(`${baseName}/api/calculation/${encodeURIComponent(name)}`, { method }).then(
    (response) => {
      if (response.status === 404) {
        throw new Error("Resource not found");
      }
    }
  );
};

export { deleteCalculationRequest };

const getCalculationDataRequest = (name) => {
  const method = "GET";
  return fetch(`${baseName}/api/calculation/${encodeURIComponent(name)}`, { method }).then(
    (response) => {
      if (response.ok) {
        return response.json();
      }
      throw Error("server error");
    }
  );
};

export { getCalculationDataRequest };

const summarizers = {
  abstractive: [
    ["t5", "T5"],
    ["bartcnn", "BART-CNN"],
    ["bartxsum", "BART-XSum"],
    ["pegasuscnn", "Pegasus-CNN"],
    ["pegasusxsum", "Pegasus-XSum"],
    ["longformer2roberta", "Longformer2Roberta"],
  ],
  extractive: [
    ["bertsum", "BERTSummarizer"],
    ["textrank", "TextRank"],
    ["newspaper3k", "Newspaper3k"],
  ],
};

const summarizersDict = {};
Object.values(summarizers).forEach((names) => {
  names.forEach(([shortName, longName]) => {
    summarizersDict[shortName] = longName;
  });
});

const summarizeRequest = (text, summarizers, ratio) => {
  const method = "POST";
  const body = JSON.stringify({ text, summarizers, ratio });
  return fetch(`${baseName}/api/summarize`, {
    method,
    body,
    headers: { "Content-Type": "application/json" },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error("failure with Request");
  });
};

export { summarizeRequest, summarizers, summarizersDict };

const feedbackRequest = (summarizer, summary, reference, url, feedback) => {
  const method = "POST";
  let body = { summarizer, summary, reference, feedback };
  if (url !== null) {
    body = { url, ...body };
  }
  body = JSON.stringify(body);
  return fetch(`${baseName}/api/feedback`, {
    method,
    body,
    headers: { "Content-Type": "application/json" },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("failure with Request");
    }
  });
};

export { feedbackRequest };
