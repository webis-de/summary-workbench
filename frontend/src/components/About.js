import React from "react";

const extractGithubUser = (url) => {
  return url.replace(/^.*\/(\w*\/.*?)$/, "$1");
};

const MetricTable = ({ content }) => (
  <table className="uk-table uk-table-striped">
    <thead>
      <tr>
        <th>Metric</th>
        <th>Code</th>
        <th>Embedding Model</th>
      </tr>
    </thead>
    <tbody>
      {content.map(([metric, paper, source, model]) => (
        <tr key={metric}>
          <td>
            <a href={paper}>{metric}</a>
          </td>
          <td>
            <a href={source}>{extractGithubUser(source)}</a>
          </td>
          <td>{model}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const metricData = [
  ["BERTScore", "https://arxiv.org/pdf/1904.09675.pdf", "https://github.com/Tiiiger/bert_score", "roberta-large-mnli"],
  ["BLEU", "https://www.aclweb.org/anthology/P02-1040.pdf", "https://github.com/Maluuba/nlg-eval", "", ],
  ["CIDEr", "https://arxiv.org/pdf/1411.5726.pdf", "https://github.com/Maluuba/nlg-eval", ""],
  ["METEOR", "https://www.aclweb.org/anthology/W05-0909.pdf", "https://github.com/Maluuba/nlg-eval", "", ],
  ["MoverScore", "https://arxiv.org/pdf/1909.02622.pdf", "https://github.com/AIPHES/emnlp19-moverscore", "distilbert-base-uncased", ],
  ["ROUGE", "https://www.aclweb.org/anthology/W04-1013.pdf", "https://github.com/pltrdy/rouge", ""],
  ["Greedy matching", "https://www.aclweb.org/anthology/W12-2018.pdf", "https://github.com/Maluuba/nlg-eval", "glove.6B.300d", ]
];

const About = () => (
  <article className="uk-container">
    <div>
      <h4>Summarization</h4>
      <div className="uk-margin-left">
        Available models:
        <ul>
          <li>
            {" "}
            <a href="https://www.aclweb.org/anthology/W04-3252/">TextRank</a>
          </li>
          <li>
            <a href="https://arxiv.org/abs/1906.04165">Bert Extractive Summarizer</a>
          </li>
          <li>
            <a href="https://newspaper.readthedocs.io/en/latest/">Newspaper3k</a>{" "}
          </li>
        </ul>
      </div>
    </div>
    <div>
      <h4>Evaluation</h4>
      <div className="uk-margin-left">
        <MetricTable content={metricData} />
        <div style={{marginTop: "1em", marginBottom: "1.5em"}} className="uk-text-meta">
          Evaluate a single hypothesis against the reference or upload hypothesis and reference
          files. Results can be saved and exported as LaTeX and CSV.
        </div>
      </div>
    </div>
    <div>
      <h4>Code</h4>
      <a
        className="uk-margin-left"
        href="https://git.informatik.uni-leipzig.de/ds40bamo/comparefile"
      >
        https://git.informatik.uni-leipzig.de/ds40bamo/comparefile
      </a>
    </div>
  </article>
);

export { About };
