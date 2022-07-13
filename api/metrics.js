const { pluginRequest, validationRequest } = require("./plugin");
const { currentConfig } = require("./config");
const cache = require("./cache")

const evaluate = async (metrics, hypotheses, references, abortController) => {
  const { METRICS } = currentConfig;
  let plugins = Object.entries(metrics).map(([metric, args]) => [
    metric,
    {
      url: METRICS[metric].url,
      args: { hypotheses, references, ...args },
    },
  ]);
  plugins = Object.fromEntries(plugins);
  const [cached, nonCached] = cache.get(plugins, METRICS)
  const validationResults = await validationRequest(nonCached, abortController);
  if (abortController.signal.aborted) return undefined
  if (Object.keys(validationResults).length) return validationResults;
  const result = await pluginRequest(nonCached, ({ scores }) => ({ scores }), abortController);
  if (abortController.signal.aborted) return undefined
  cache.add(result, plugins, METRICS)
  return {...cached, ...result}
};

module.exports = { evaluate };
