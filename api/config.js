const fs = require("fs");

let data;
try {
  data = fs.readFileSync("/plugin_config/plugin_config.json");
} catch (err) {
  console.log("no plugin config found");
  process.exit(1);
}

try {
  data = JSON.parse(data);
} catch (err) {
  console.log("invalid plugin config content");
  process.exit(1);
}

METRICS_INFO = data.metrics;
SUMMARIZERS_INFO = data.summarizers;

METRICS = Object.keys(METRICS_INFO);
SUMMARIZERS = Object.keys(SUMMARIZERS_INFO);

console.log("Metrics: ", METRICS);
console.log("Summarizers: ", SUMMARIZERS);

const to_envvar = (name) => name.toUpperCase().replace(/-/g, "_");

const METRIC_URLS = METRICS.reduce((acc, val) => {
  url = `${to_envvar(val)}_URL`;
  return { [val]: process.env[url], ...acc };
}, {});

const SUMMARIZER_URLS = SUMMARIZERS.reduce((acc, val) => {
  const url = `${to_envvar(val)}_URL`;
  return { [val]: process.env[url], ...acc };
}, {});

const PORT = process.env.PORT || 5000;
console.log("Modus:", process.env.NODE_ENV);

let ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
let REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  if (process.env.NODE_ENV === "development") {
    ACCESS_TOKEN_SECRET = "no_secret";
    REFRESH_TOKEN_SECRET = "no_secret";
  } else {
    console.error(
      'the "ACCESS_TOKEN_SECRET" and "REFRESH_TOKEN_SECRET" environment variables have to be set when not running in DEBUG mode'
    );
    process.exit(1);
  }
} else {
  ACCESS_TOKEN_SECRET = Buffer.from(ACCESS_TOKEN_SECRET, "base64");
  REFRESH_TOKEN_SECRET = Buffer.from(ACCESS_TOKEN_SECRET, "base64");
}

const MONGODB_HOST = process.env.MONGODB_HOST;

module.exports = {
  METRICS_INFO,
  SUMMARIZERS_INFO,
  METRICS,
  SUMMARIZERS,
  METRIC_URLS,
  SUMMARIZER_URLS,
  MONGODB_HOST,
  PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};
