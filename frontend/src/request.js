const DEVELOP = process.env.REACT_APP_DEVELOP;
let baseName = "";
if (DEVELOP === "true") {
  const HOST = process.env.REACT_APP_API_HOST || "localhost";
  const PORT = process.env.REACT_APP_API_PORT || "5000";
  baseName = `http://${HOST}:${PORT}`;
  console.log(baseName);
}

const post = async (path, json = null, auth = null) => {
  const args = { method: "POST", credentials: "include" };
  const headers = {};
  if (json) {
    args.body = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    args.credentials = "include";
    headers.Authorization = `Bearer ${auth}`;
  }
  args.headers = headers;
  const response = await fetch(`${baseName}${path}`, args);
  const resJson = await response.json();
  if (response.ok) return resJson;
  throw resJson;
};

const get = async (path) => {
  const response = await fetch(`${baseName}${path}`, { method: "GET" });
  const resJson = await response.json();
  if (response.ok) return resJson;
  throw resJson;
};

const del = async (path) => {
  const method = "DELETE";
  const response = await fetch(`${baseName}${path}`, {
    method,
  });
  const resJson = await response.json();
  if (response.ok) return resJson;
  throw resJson;
};

export { post, get, del };
