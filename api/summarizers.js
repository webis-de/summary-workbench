const { SUMMARIZERS, SUMMARIZER_URLS } = require("./config");
console.log(SUMMARIZER_URLS)
const axios = require("axios");

const summarize = async (summarizers, text, ratio) => {
  const requested_summaries = [...(new Set(summarizers))].filter((x) => SUMMARIZERS.includes(x));
  const requests = requested_summaries.map((summarizer) => axios.post(SUMMARIZER_URLS[summarizer], { text, ratio }))
  const results = (await axios.all(requests)).map((response) => response.data);
  const summaries = results.reduce((acc, val) => ({ ...val, ...acc }), {});
  return summaries
}

module.exports = { summarize }
