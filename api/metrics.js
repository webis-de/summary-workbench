const { pluginRequest, validationRequest } = require("./plugin");
const { currentConfig } = require("./config");

const evaluate = async (metrics, hypotheses, references) => {
  const { METRICS } = currentConfig;
  let plugins = Object.entries(metrics).map(([metric, args]) => [
    metric,
    {
      url: METRICS[metric].url,
      args: { hypotheses, references, ...args },
    },
  ]);
  plugins = Object.fromEntries(plugins);
  const validationResults = await validationRequest(plugins);
  if (Object.keys(validationResults).length) return validationResults;
  return pluginRequest(plugins, ({ scores }) => ({ scores }));
};

module.exports = { evaluate };
