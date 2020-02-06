const deleteHypsRequest = () => {
  const method = "DELETE";
  return fetch("http://localhost:5000/api/hyp", { method });
};

export { deleteHypsRequest };

const deleteRefsRequest = () => {
  const method = "DELETE";
  return fetch("http://localhost:5000/api/ref", { method });
};

export { deleteRefsRequest };

const getCalculationRequest = () => {
  const method = "GET";
  return fetch("http://localhost:5000/api/lastcalculation", { method });
};

export { getCalculationRequest };

const calculateRequest = (hypname, refname) => {
  const method = "PUT";
  const body = JSON.stringify({ hypname, refname });
  return fetch("http://localhost:5000/api/lastcalculation", {
    method,
    body,
    headers: { "Content-Type": "application/json" }
  });
};

export { calculateRequest };

const getHypFilesRequest = () => {
  const method = "GET";
  return fetch("http://localhost:5000/api/hyp", { method });
};

export { getHypFilesRequest };

const getRefFilesRequest = () => {
  const method = "GET";
  return fetch("http://localhost:5000/api/ref", { method });
};

export { getRefFilesRequest };

const uploadHypFileRequest = (filename, filecontent) => {
  const method = "POST";
  const body = JSON.stringify({ filename, filecontent });
  return fetch("http://localhost:5000/api/hyp", {
    method,
    body,
    headers: { "Content-Type": "application/json" }
  });
};

export { uploadHypFileRequest };

const uploadRefFileRequest = (filename, filecontent) => {
  const method = "POST";
  const body = JSON.stringify({ filename, filecontent });
  return fetch("http://localhost:5000/api/ref", {
    method,
    body,
    headers: { "Content-Type": "application/json" }
  });
};

export { uploadRefFileRequest };

const saveCalculationRequest = name => {
  const method = "POST";
  const body = JSON.stringify({ name: name });
  const headers = { "Content-Type": "application/json" };
  return fetch("http://localhost:5000/api/calculations", {
    method,
    body,
    headers
  });
};

export { saveCalculationRequest };

const getSettingsRequest = () => {
  const method = "GET";
  return fetch("http://localhost:5000/api/setting", { method });
};

export { getSettingsRequest };

const setSettingRequest = (metric, is_set) => {
  const body = JSON.stringify({ metric, is_set });
  const method = "PATCH";
  const headers = { "Content-Type": "application/json" };
  return fetch("http://localhost:5000/api/setting", { method, body, headers });
};

export { setSettingRequest };

const getCompareDataRequest = (fetchUrlInfix, start, end) => {
  const method = "GET";
  return fetch(
    "http://localhost:5000/api/" +
      encodeURIComponent(fetchUrlInfix) +
      `?start=${start}&end=${end}`,
    { method }
  );
};

export { getCompareDataRequest };
