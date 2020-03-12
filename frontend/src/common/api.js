const calculateRequest = (metrics, hypdata, refdata) => {
  const method = "POST";
  const body = JSON.stringify({ metrics, hypdata, refdata });
  return fetch("http://localhost:5000/api/calculate", {
    method,
    body,
    headers: { "Content-Type": "application/json" }
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
    headers
  });
};

export { saveCalculationRequest };

const getSavedCalculationsRequest = () => {
  const method = "GET";
  return fetch("http://localhost:5000/api/calculations", { method });
};

export { getSavedCalculationsRequest };

const deleteCalculationRequest = name => {
  const method = "DELETE";
  return fetch(
    "http://localhost:5000/api/calculation/" + encodeURIComponent(name),
    {
      method
    }
  );
};

export { deleteCalculationRequest };

const getCompareDataRequest = (name, start, end) => {
  const method = "GET";
  return fetch(
    "http://localhost:5000/api/calculation/" +
      encodeURIComponent(name) +
      `?start=${start}&end=${end}`,
    { method }
  );
};

export { getCompareDataRequest };
