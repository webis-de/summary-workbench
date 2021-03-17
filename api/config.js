const METRICS = process.env["METRICS"]
  .split(" ")
  .filter((metric) => Boolean(metric));

console.log("Metrics: ", METRICS);

const SUMMARIZERS = process.env["SUMMARIZERS"]
  .split(" ")
  .filter((metric) => Boolean(metric));

console.log("Summarizers: ", SUMMARIZERS);

const METRIC_URLS = METRICS.reduce((acc, val) => {
  url = `${val.toUpperCase()}_METRIC_URL`;
  return { [url]: process.env[url], ...acc };
}, {});

const SUMMARIZER_URLS = SUMMARIZERS.reduce((acc, val) => {
  url = `${val.toUpperCase()}_SUMMARIZER_URL`;
  return { [url]: process.env[url], ...acc };
}, {});

const PORT = process.env["PORT"] || 5000;
const DEBUG = process.env["DEBUG"];
console.log("DEBUG:", DEBUG);
let ACCESS_TOKEN_SECRET = process.env["ACCESS_TOKEN_SECRET"];
let REFRESH_TOKEN_SECRET = process.env["REFRESH_TOKEN_SECRET"];

if (!ACCESS_TOKEN_SECRET && !REFRESH_TOKEN_SECRET) {
  if (DEBUG) {
    ACCESS_TOKEN_SECRET = "no_secret";
    REFRESH_TOKEN_SECRET = "no_secret";
  } else {
    console.error(
      'the "ACCESS_TOKEN_SECRET" and "REFRESH_TOKEN_SECRET" environment variables have to be set when not running in DEBUG mode'
    );
    process.exit(1);
  }
}

const MONGODB_HOST = process.env["MONGODB_HOST"];

module.exports = {
  METRIC_URLS,
  SUMMARIZER_URLS,
  MONGODB_HOST,
  PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};
