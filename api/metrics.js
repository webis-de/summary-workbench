const { currentConfig } = require("./config");
const axios = require("axios");

const evaluate = async (metrics, hypotheses, references) => {
  const { METRICS, METRIC_KEYS } = currentConfig;
  const requested_metrics = [...new Set(metrics)].filter((x) =>
    METRIC_KEYS.includes(x)
  );
  const requests = requested_metrics.map((metric) =>
    axios.post(METRICS[metric].url, { hypotheses, references })
  );
  const results = (await axios.all(requests)).map((response) => response.data);
  const scores = {};
  requested_metrics.forEach((metric, index) => {
    scores[metric] = results[index]["score"];
  });
  return scores;
};

module.exports = { evaluate };
