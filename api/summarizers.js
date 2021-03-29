const { SUMMARIZERS, SUMMARIZER_URLS } = require("./config");
const axios = require("axios");

const summarize = async (summarizers, text, ratio) => {
  const requested_summarizers = [...(new Set(summarizers))].filter((x) => SUMMARIZERS.includes(x));
  const requests = requested_summarizers.map((summarizer) => axios.post(SUMMARIZER_URLS[summarizer], { text, ratio }))
  const results = (await axios.all(requests)).map((response) => response.data);
  const summaries = {}
  requested_summarizers.forEach((summarizer, index) => {
    summaries[summarizer] = results[index]["summary"];
  });
  return summaries
}

module.exports = { summarize }
