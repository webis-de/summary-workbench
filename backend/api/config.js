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

const PORT = process.env["PORT"] || 5000
const MONGODB_HOST = process.env["MONGODB_HOST"]

module.exports = { metricURLs, summarizerURLs, MONGODB_HOST, PORT};
