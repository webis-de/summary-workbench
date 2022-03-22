const { pluginRequest, validationRequest } = require("./plugin");
const { currentConfig } = require("./config");

const summarize = async (summarizers, text, ratio) => {
  const { SUMMARIZERS } = currentConfig;
  let plugins = Object.entries(summarizers).map(([summarizer, args]) => [
    summarizer,
    {
      url: SUMMARIZERS[summarizer].url,
      args: { text, ratio, ...args },
    },
  ]);
  plugins = Object.fromEntries(plugins);
  return pluginRequest(plugins, ({ summary }) => ({ summary }));
};

module.exports = { summarize };
