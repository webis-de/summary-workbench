const { pluginRequest, validationRequest } = require("./plugin");
const { currentConfig } = require("./config");
const cache = require("./cache")

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
  const [cached, nonCached] = cache.get(plugins, SUMMARIZERS)
  const validationResults = await validationRequest(nonCached, abortController);
  if (abortController.signal.aborted) return undefined;
  if (Object.keys(validationResults).length) return validationResults;
  const result = await pluginRequest(nonCached, ({ summary }) => ({ summary }), abortController);
  if (abortController.signal.aborted) return undefined;
  cache.add(result, plugins, SUMMARIZERS)
  return {...cached, ...result}
};

module.exports = { summarize };
