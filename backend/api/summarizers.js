const { summarizerURLs } = require("./config");
const axios = require("axios");

const SINGLE_SUMMARIZERS = {
  bertsum: summarizerURLs["BERTSUM_URL"],
  t5: summarizerURLs["T5_URL"],
  bartcnn: summarizerURLs["BARTCNN_URL"],
  bartxsum: summarizerURLs["BARTXSUM_URL"],
  pegasuscnn: summarizerURLs["PEGASUSCNN_URL"],
  pegasusxsum: summarizerURLs["PEGASUSXSUM_URL"],
  longformer2roberta: summarizerURLs["LONGFORMER2ROBERTA_URL"],
};
const SIMPLE_SUMMARIZERS_URL = summarizerURLs["SIMPLE_SUMMARIZERS_URL"];
const MULTIPLE_SUMMARIZERS = ["textrank", "newspaper3k"];

const AVAILABLE_SUMMARIZERS = new Set(
  Object.keys(SINGLE_SUMMARIZERS).concat(MULTIPLE_SUMMARIZERS)
);
const AVAILABLE_SINGLE_SUMMARIZERS = new Set(Object.keys(SINGLE_SUMMARIZERS));
const AVAILABLE_MULTIPLE_SUMMARIZERS = new Set(
  MULTIPLE_SUMMARIZERS
);

class Summarizers {
  constructor() {
    this.AVAILABLE_SUMMARIZERS = AVAILABLE_SUMMARIZERS;
  }
  async summarize(summarizers, text, ratio) {
    const request_summarizers = new Set(summarizers);
    const requested_single_summarizers = [...request_summarizers].filter((x) =>
      AVAILABLE_SINGLE_SUMMARIZERS.has(x)
    );
    const requested_multiple_summarizers = [
      ...request_summarizers,
    ].filter((x) => AVAILABLE_MULTIPLE_SUMMARIZERS.has(x));

    const single_requests = requested_single_summarizers.length
      ? requested_single_summarizers.map((summarizer) =>
          axios.post(SINGLE_SUMMARIZERS[summarizer], { text, ratio })
        )
      : [];
    const multiple_request = requested_multiple_summarizers.length
      ? axios.post(SIMPLE_SUMMARIZERS_URL, {
          summarizers: requested_multiple_summarizers,
          text,
          ratio,
        })
      : [];

    const results = (await axios.all([multiple_request, ...single_requests])).map(
      (response) => response.data
    );
    let summaries = {}
    for (const result of results) {
      summaries = {...summaries, ...result}
    }
    return summaries
  }
}

module.exports = new Summarizers();
