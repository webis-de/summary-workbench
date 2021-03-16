const metricURLs = {
  BERT_URL: process.env["BERT_URL"],
  GREEDY_MATCHING_URL: process.env["GREEDY_MATCHING_URL"],
  METEOR_URL: process.env["METEOR_URL"],
  MOVER_SCORE_URL: process.env["MOVER_SCORE_URL"],
  BLEURT_URL: process.env["BLEURT_URL"],
  SENTENCE_TRANSFORMERS_URL: process.env["SENTENCE_TRANSFORMERS_URL"],
  SIMPLE_METRICS_URL: process.env["SIMPLE_METRICS_URL"],
};

const summarizerURLs = {
  BERTSUM_URL: process.env["BERTSUM_URL"],
  T5_URL: process.env["T5_URL"],
  BARTCNN_URL: process.env["BARTCNN_URL"],
  BARTXSUM_URL: process.env["BARTXSUM_URL"],
  PEGASUSCNN_URL: process.env["PEGASUSCNN_URL"],
  PEGASUSXSUM_URL: process.env["PEGASUSXSUM_URL"],
  LONGFORMER2ROBERTA_URL: process.env["LONGFORMER2ROBERTA_URL"],
  SIMPLE_SUMMARIZERS_URL: process.env["SIMPLE_SUMMARIZERS_URL"],
};

const PORT = process.env["PORT"] || 5000;
const DEBUG = process.env["DEBUG"];
let ACCESS_TOKEN_SECRET = process.env["ACCESS_TOKEN_SECRET"];
let REFRESH_TOKEN_SECRET = process.env["REFRESH_TOKEN_SECRET"];

if (!ACCESS_TOKEN_SECRET && !REFRESH_TOKEN_SECRET) {
  if (DEBUG) {
    ACCESS_TOKEN_SECRET = "no_secret";
    REFRESH_TOKEN_SECRET = "no_secret";
  } else {
    console.error(
      'the "ACCESS_TOKEN_SECRET" and "REFRESH_TOKEN_SECRET" environment variables have to be set when not running in DEBUG mode'
    );
    process.exit(1);
  }
}

const MONGODB_HOST = process.env["MONGODB_HOST"];

module.exports = { metricURLs, summarizerURLs, MONGODB_HOST, PORT, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET };
