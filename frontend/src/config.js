const devAPI = () => {
  const HOST = process.env.REACT_APP_API_HOST || "localhost";
  const PORT = process.env.REACT_APP_API_PORT || "5000";
  return `http://${HOST}:${PORT}`;
};

const apiBase = process.env.NODE_ENV === "development" ? devAPI() : "";

export { apiBase };
