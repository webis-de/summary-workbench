const calculateRequest = (metrics, hypdata, refdata) => {
  const method = "POST";
  const body = JSON.stringify({ metrics, hypdata, refdata });
  return fetch("http://localhost:5000/api/calculate", {
    method,
    body,
    headers: { "Content-Type": "application/json" },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("response not ok");
    }
  });
};

export { calculateRequest };

const saveCalculationRequest = (name, scores, comparisons) => {
  const method = "POST";
  const body = JSON.stringify({ name, scores, comparisons });
  const headers = { "Content-Type": "application/json" };
  return fetch("http://localhost:5000/api/calculations", {
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
  return fetch("http://localhost:5000/api/calculations", {
    method,
  }).then((response) => response.json());
};

export { getSavedCalculationsRequest };

const deleteCalculationRequest = (name) => {
  const method = "DELETE";
  return fetch(
    "http://localhost:5000/api/calculation/" + encodeURIComponent(name),
    { method }
  ).then((response) => {
    if (response.status === 404) {
      throw new Error("Resource not found");
    }
  });
};

export { deleteCalculationRequest };

const getCompareDataRequest = (name) => {
  const method = "GET";
  return fetch(
    "http://localhost:5000/api/calculation/" + encodeURIComponent(name),
    { method }
  ).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      alert("server error");
    }
  });
};

export { getCompareDataRequest };

const getExportRequest = (scores, format, transpose, precision) => {
  const method = "POST";
  const body = JSON.stringify({ scores, format, transpose, precision });
  return fetch("http://localhost:5000/api/export", {
    method,
    body,
    headers: { "Content-Type": "application/json" },
  }).then((response) => response.json());
};

export { getExportRequest };

const summarizers = [
  ["textrank", "TextRank"],
  ["bert", "BERTSummarizer"],
  ["newspaper3k", "Newspaper3k"],
];

const summarizeKinds = [
  ["raw", "raw text"],
  ["url", "URL"],
];

const summarizeRequest = (text, summarizer, kind) => {
  const method = "POST";
  const body = JSON.stringify({ text, summarizer, kind });
  return fetch("http://localhost:5000/api/summarize", {
    method,
    body,
    headers: { "Content-Type": "application/json" },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("failure with Request");
    }
  });
};

export { summarizeRequest, summarizers, summarizeKinds };
