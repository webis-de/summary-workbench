const DEVELOP = process.env.REACT_APP_DEVELOP;
let baseName = "";
if (DEVELOP === "true") {
  const HOST = process.env.REACT_APP_API_HOST;
  const PORT = process.env.REACT_APP_API_PORT;
  baseName = `http://${HOST}:${PORT}`;
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
    } else {
      throw new Error("response not ok");
    }
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
  return fetch(`${baseName}/api/calculation/` + encodeURIComponent(name), { method }).then(
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
  return fetch(`${baseName}/api/calculation/` + encodeURIComponent(name), { method }).then(
    (response) => {
      if (response.ok) {
        return response.json();
      } else {
        alert("server error");
      }
    }
  );
};

export { getCalculationDataRequest };

const summarizers = [
  ["textrank", "TextRank"],
  ["bert", "BERTSummarizer"],
  ["newspaper3k", "Newspaper3k"],
];

const summarizeRequest = (text, summarizers, ratio, kind) => {
  const method = "POST";
  const body = JSON.stringify({ text, summarizers, ratio, kind });
  return fetch(`${baseName}/api/summarize`, {
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

export { summarizeRequest, summarizers };
