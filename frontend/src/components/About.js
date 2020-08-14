import React from "react";

import { Section } from "./utils/Section";

const extractGithubUser = (url) => {
  return url.replace(/^.*\/(\w*\/.*?)$/, "$1");
};

const MetricTable = ({ content }) => (
  <table className="uk-table uk-table-divider uk-table-striped">
    <thead>
      <tr>
        <th>Metric</th>
        <th>Source</th>
        <th>Embedding Model</th>
      </tr>
    </thead>
    <tbody>
      {content.map(([metric, source, model]) => (
        <tr key={metric}>
          <td>{metric}</td>
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
  ["BERTScore", "https://github.com/Tiiiger/bert_score", "roberta-large-mnli"],
  ["BLEU", "https://github.com/Maluuba/nlg-eval", ""],
  ["CIDEr", "https://github.com/Maluuba/nlg-eval", ""],
  ["METEOR", "https://github.com/Maluuba/nlg-eval", ""],
  ["MoverScore", "https://github.com/AIPHES/emnlp19-moverscore", "distilbert-base-uncased"],
  ["ROUGE", "https://github.com/pltrdy/rouge", ""],
  ["greedy matching", "https://github.com/Maluuba/nlg-eval", "glove.6B.300d"],
];

const About = () => (
  <article className="uk-container">
    <div>
    <h4>Summarize</h4>
    <p className="uk-margin-left">
        Available models:
        <ul>
          <li> <a href="https://www.aclweb.org/anthology/W04-3252/">TextRank</a></li>
          <li><a href="https://arxiv.org/abs/1906.04165">Bert Extractive Summarizer</a></li>
          <li><a href="https://newspaper.readthedocs.io/en/latest/">Newspaper3k</a> </li>
        </ul>
    </p>
    </div>
    <div>
    <h4>Evaluate</h4>
        <p className="uk-margin-left">
        <MetricTable content={metricData} />
        <p className="uk-text-meta">Evaluate a single hypothesis against the reference or upload hypothesis and reference files. Results can be saved and exported as LaTeX and CSV.</p> 
      </p>
    </div>
    <div>
      <h4>Code</h4>
    <p className="uk-margin-left"></p>
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
