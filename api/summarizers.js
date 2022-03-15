const { currentConfig } = require("./config");
const axios = require("axios");

const summarize = async (summarizers, text, ratio) => {
  const { SUMMARIZERS, SUMMARIZER_KEYS } = currentConfig;
  const requested_summarizers = [...new Set(summarizers)].filter((x) =>
    SUMMARIZER_KEYS.includes(x)
  );
  const requests = requested_summarizers.map((summarizer) =>
    axios.post(SUMMARIZERS[summarizer].url, { text, ratio })
  );
  const results = (await axios.all(requests)).map((response) => response.data);
  const summaries = {};
  requested_summarizers.forEach((summarizer, index) => {
    summaries[summarizer] = results[index]["summary"];
  });
  return summaries;
};

module.exports = { summarize };
