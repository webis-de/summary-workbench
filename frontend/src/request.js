import { apiBase } from "./config";

const request = async (method, path, json, options = {}) => {
  const { auth, abortController } = options;
  const args = { method, credentials: "include" };
  const headers = {};
  if (json) {
    args.body = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  }
  if (auth) headers.Authorization = `Bearer ${auth}`;
  args.headers = headers;
  if (abortController) args.signal = abortController.signal;
  try {
    const response = await fetch(`${apiBase}${path}`, args);
    return response.json();
  } catch (error) {
    if (abortController && abortController.signal.aborted) return undefined;
    throw error
  }
};

const post = async (path, json, options) => request("POST", path, json, options);
const get = async (path, options) => request("GET", path, null, options);
const del = async (path, options) => request("DELETE", path, null, options);

const wrappedFetch = (path, args) => fetch(`${apiBase}${path}`, args);

export { post, get, del, wrappedFetch };
