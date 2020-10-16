const DEVELOP = process.env.REACT_APP_DEVELOP;
let baseName = "";
if (DEVELOP === "true") {
  const HOST = process.env.REACT_APP_API_HOST;
  const PORT = process.env.REACT_APP_API_PORT;
  baseName = `http://${HOST}:${PORT}`;
}

const evaluateRequest = (metrics, hypdata, refdata, summ_eval) => {
  const method = "POST";
  const body = JSON.stringify({ metrics, hypdata, refdata, summ_eval });
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

const summarizers = {
  "abstractive": [
    ["bertsum", "BERTSummarizer"],
    ["t5", "T5"],
    ["bartcnn", "BART-CNN"],
    ["bartxsum", "BART-XSum"],
    ["pegasuscnn", "Pegasus-CNN"],
    ["pegasusxsum", "Pegasus-XSum"],
    ["longformer2roberta", "Longformer2Roberta"],
  ],
  "extractive": [
    ["textrank", "TextRank"],
    ["newspaper3k", "Newspaper3k"],
  ]
};

const summarizersDict = {}
for (const names of Object.values(summarizers)) {
  for (const [shortName, longName] of names) {
    summarizersDict[shortName] = longName
  }
}

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

export { summarizeRequest, summarizers, summarizersDict };


const feedbackRequest = (summarizer, summary, reference, url, feedback) => {
  const method = "POST";
  let body = { summarizer, summary, reference, feedback };
  if (url !== null) {
    body = {url, ...body}
  }
  body = JSON.stringify(body)
  return fetch(`${baseName}/api/feedback`, {
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

export { feedbackRequest };
