const { SUMMARIZERS, SUMMARIZER_URLS } = require("./config");
const axios = require("axios");

const summarize = async (summarizers, text, ratio) => {
  const requested_summaries = [...(new Set(summarizers))].filter((x) => SUMMARIZERS.has(x));
  const requests = requested_summaries.map((summarizer) => axios.post(SUMMARIZER_URL_URLS[summarizer], { text, ratio }))
  const results = (await axios.all(...requests)).map((response) => response.data);
  const summaries = results.reduce((acc, val) => ({ ...result, ...acc }), {});
  return summaries
}

module.exports = { summarize }
