const { metricURLs } = require("./config");
const axios = require("axios");

const SINGLE_METRICS = {
  bert: metricURLs["BERT_URL"],
  greedy_matching: metricURLs["GREEDY_MATCHING_URL"],
  meteor: metricURLs["METEOR_URL"],
  moverscore: metricURLs["MOVER_SCORE_URL"],
  bleurt: metricURLs["BLEURT_URL"],
  sentence_transformers: metricURLs["SENTENCE_TRANSFORMERS_URL"],
};
const MULTIPLE_METRICS = ["bleu", "cider", "rouge"];
const SIMPLE_METRICS_URL = metricURLs["SIMPLE_METRICS_URL"];

const AVAILABLE_METRICS = new Set(
  Object.keys(SINGLE_METRICS).concat(MULTIPLE_METRICS)
);
const AVAILABLE_SINGLE_METRICS = new Set(Object.keys(SINGLE_METRICS));
const AVAILABLE_MULTIPLE_METRICS = new Set(MULTIPLE_METRICS);

class Metrics {
  constructor() {
    this.AVAILABLE_METRICS = AVAILABLE_METRICS;
  }
  async evaluate(metrics, hyps, refs) {
    const request_metrics = new Set(metrics);
    const requested_single_metrics = [...request_metrics].filter((x) =>
      AVAILABLE_SINGLE_METRICS.has(x)
    );
    const requested_multiple_metrics = [...request_metrics].filter((x) =>
      AVAILABLE_MULTIPLE_METRICS.has(x)
    );

    const single_requests = requested_single_metrics.length
      ? requested_single_metrics.map((metric) =>
          axios.post(SINGLE_METRICS[metric], { hyps, refs }).then()
        )
      : [];
    const multiple_request = requested_multiple_metrics.length
      ? axios.post(SIMPLE_METRICS_URL, {
          metrics: requested_multiple_metrics,
          hyps,
          refs,
        })
      : [];
    const results = (await axios.all([multiple_request, ...single_requests])).map(
        (response) => response.data
      );
    let scores = {}
    for (const result of results) {
      scores = {...scores, ...result}
    }
    return scores
  }
}

module.exports = new Metrics();
