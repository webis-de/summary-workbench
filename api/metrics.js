const { METRICS, METRIC_URLS } = require("./config");
const axios = require("axios");

const evaluate = async(metrics, hyps, refs) => {
  const requested_metrics = [...(new Set(metrics))].filter((x) => METRICS.has(x));
  const requests = requested_metrics.map((metric) => axios.post(METRIC_URLS[metric], { hyps, refs }))
  const results = (await axios.all(...requests)).map((response) => response.data);
  const scores = results.reduce((acc, val) => ({ ...result, ...acc }), {});
  return scores
}

module.exports = { evaluate }
