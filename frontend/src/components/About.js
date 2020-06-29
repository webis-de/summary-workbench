import React from "react";

const extractGithubUser = (url) => {
  return url.replace(/^.*\/(\w*\/.*?)$/, "$1");
};

const Section = ({ children, title }) => (
  <section className="uk-card uk-card-default uk-card-body">
    <h4 className="uk-card-title lul">{title}</h4>
    {children}
  </section>
);

const MetricTable = ({ content }) => (
  <table className="uk-table">
    <thead>
      <tr>
        <th>Metric</th>
        <th>Source</th>
        <th>Model</th>
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
  [
    "MoverScore",
    "https://github.com/AIPHES/emnlp19-moverscore",
    "distilbert-base-uncased",
  ],
  ["ROUGE", "https://github.com/pltrdy/rouge", ""],
  ["greedy matching", "https://github.com/Maluuba/nlg-eval", "glove.6B.300d"],
];

const About = () => (
  <article className="uk-container">
    <Section title="Description">
      <p className="uk-margin-left">
        Compute various NLP-metrics between pairs of sentences, highlight
        simmilar words and phrases and summarize long texts. Results can be
        saved and exported as LaTeX and CSV.
      </p>
    </Section>
    <Section title="Sourcecode">
      <a
        className="uk-margin-left"
        href="https://git.informatik.uni-leipzig.de/ds40bamo/comparefile"
      >
        https://git.informatik.uni-leipzig.de/ds40bamo/comparefile
      </a>
    </Section>
    <Section title="Used Metrics and Implementations">
      <MetricTable content={metricData} />
    </Section>
  </article>
);

export { About };
