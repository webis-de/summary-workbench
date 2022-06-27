const { pluginRequest, validationRequest } = require("./plugin");
const { currentConfig } = require("./config");

const summarize = async (summarizers, text, ratio, abortController) => {
  const { SUMMARIZERS } = currentConfig;
  let plugins = Object.entries(summarizers).map(([summarizer, args]) => [
    summarizer,
    {
      url: SUMMARIZERS[summarizer].url,
      args: { text, ratio, ...args },
    },
  ]);
  plugins = Object.fromEntries(plugins);
  const validationResults = await validationRequest(plugins, abortController);
  if (abortController.signal.aborted) return;
  if (Object.keys(validationResults).length) return validationResults;
  return pluginRequest(plugins, ({ summary }) => ({ summary }), abortController);
};

module.exports = { summarize };
