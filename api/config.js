const fs = require("fs");
const axios = require("axios");

const isProduction = process.env.NODE_ENV !== "development"

const fetchConfig = async (url, key, timeout) => {
  try {
    const response = await axios({
      method: "get",
      url: `${url}/config`,
      timeout,
    })
    const config = response.data;
    config.url = url;
    config.disabled = false;
    config.healthy = true;
    return config;
  } catch (err) {
    console.error(`service for ${url} is unavailable`);
    return { disabled: false, healthy: false, key };
  }
};

const gatherConfigs = async (timeout) => {
  let pluginConfig;
  try {
    pluginConfig = fs.readFileSync("/plugin_config/plugin_config.json");
  } catch (err) {
    console.log("no plugin config found");
    process.exit(1);
  }

  try {
    pluginConfig = JSON.parse(pluginConfig);
  } catch (err) {
    console.log("invalid plugin config content");
    process.exit(1);
  }

  const configs = { summarizer: {}, metric: {} };

  await Promise.all(
    Object.entries(pluginConfig).map(async ([key, value]) => {
      let c = { ...value, disabled: true };
      if (typeof value === "string") c = await fetchConfig(value, key, timeout);
      if (key !== c.key) {
        console.error(`plugin is configured as ${key} but container has key ${c.key}`);
      }
      if (!c.type) [c.type] = key.split("-");
      if (!c.name) [, , c.name] = key.split("-");
      if (!c.metadata) c.metadata = {};
      if (!configs[c.type]) configs[c.type] = {};
      configs[c.type][key] = c;
    })
  );

  return configs;
};

const currentConfig = {};

const initConfig = async (timeout = 30000) => {
  if (!isProduction) console.log("updating config...");
  let gatherTimeout = 15000;
  if (!Object.keys(currentConfig).length) gatherTimeout = 2000
  const config = await gatherConfigs(gatherTimeout);
  currentConfig.METRICS = config.metric;
  currentConfig.SUMMARIZERS = config.summarizer;
  currentConfig.METRIC_KEYS = Object.entries(currentConfig.METRICS)
    .filter(([, value]) => !value.disabled && value.healthy)
    .map(([key]) => key);
  currentConfig.SUMMARIZER_KEYS = Object.entries(currentConfig.SUMMARIZERS)
    .filter(([, value]) => !value.disabled && value.healthy)
    .map(([key]) => key);
  if (!isProduction) console.log("config updated");
  setTimeout(() => initConfig(timeout), timeout);
};

const PORT = process.env.PORT || 5000;
console.log("Modus:", process.env.NODE_ENV);

// let { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

// if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
//   if (!isProduction) {
//     ACCESS_TOKEN_SECRET = "no_secret";
//     REFRESH_TOKEN_SECRET = "no_secret";
//   } else {
//     console.error(
//       'the "ACCESS_TOKEN_SECRET" and "REFRESH_TOKEN_SECRET" environment variables have to be set when not running in DEBUG mode'
//     );
//     process.exit(1);
//   }
// } else {
//   ACCESS_TOKEN_SECRET = Buffer.from(ACCESS_TOKEN_SECRET, "base64");
//   REFRESH_TOKEN_SECRET = Buffer.from(ACCESS_TOKEN_SECRET, "base64");
// }

const { MONGODB_HOST } = process.env;

module.exports = {
  currentConfig,
  initConfig,
  isProduction,
  MONGODB_HOST,
  PORT,
  // ACCESS_TOKEN_SECRET,
  // REFRESH_TOKEN_SECRET,
};
