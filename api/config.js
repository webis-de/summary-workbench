const fs = require("fs");
const axios = require("axios");

const fetchConfig = async (url) => {
  try {
    const config = (await axios.get(`${url}/config`)).data;
    config.url = url
    config.disabled = false;
    config.healthy = true;
    return config
  } catch (err) {
    console.error(`service for ${url} is unavailable`);
    return { disabled: false, healthy: false };
  }
};

const gatherConfigs = async () => {
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

  const collectedConfig = {};
  const fetchConfigs = {};
  Object.entries(pluginConfig).map(([key, value]) => {
    if (typeof value == "string") {
      fetchConfigs[key] = fetchConfig(value);
    } else {
      value.disabled = true;
      collectedConfig[key] = value;
    }
  });

  for ([key, request] of Object.entries(fetchConfigs)) {
    const config = await request;
    if (key != config.key) {
      console.error(
        `plugin is configured as ${key} but container has key ${config.key}`
      );
    }
    collectedConfig[key] = config
  }

  const config = { summarizer: {}, metric: {} };

  Object.entries(collectedConfig).forEach(([key, pluginConfig]) => {
    if (!pluginConfig.type) pluginConfig.type = key.split("-")[0];
    if (!pluginConfig.name) pluginConfig.name = key.split("-")[2];
    if (!pluginConfig.metadata) pluginConfig.metadata = {};
    if (!config[pluginConfig.type]) config[pluginConfig.type] = {};
    config[pluginConfig.type][key] = pluginConfig
  });

  return config;
};

const currentConfig = {};

const initConfig = async (timeout=30000) => {
  console.log("updating config...");
  const config = await gatherConfigs();
  currentConfig.METRICS = config.metric;
  currentConfig.SUMMARIZERS = config.summarizer;
  currentConfig.METRIC_KEYS = Object.entries(currentConfig.METRICS)
    .filter(([, value]) => !value.disabled && value.healthy)
    .map(([key]) => key);
  currentConfig.SUMMARIZER_KEYS = Object.entries(currentConfig.SUMMARIZERS)
    .filter(([, value]) => !value.disabled && value.healthy)
    .map(([key]) => key);
  console.log("config updated...");
  setTimeout(initConfig, timeout);
};

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
  currentConfig,
  initConfig,
  MONGODB_HOST,
  PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};
