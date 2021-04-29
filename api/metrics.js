const { METRICS, METRIC_URLS } = require("./config");
const axios = require("axios");

const evaluate = async (metrics, hypotheses, references) => {
  const requested_metrics = [...new Set(metrics)].filter((x) =>
    METRICS.includes(x)
  );
  const requests = requested_metrics.map((metric) =>
    axios.post(METRIC_URLS[metric], { hypotheses, references })
  );
  const results = (await axios.all(requests)).map((response) => response.data);
  const scores = {};
  requested_metrics.forEach((metric, index) => {
    scores[metric] = results[index]["score"];
  });
  return scores;
};

module.exports = { evaluate };
