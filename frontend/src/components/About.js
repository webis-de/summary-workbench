import React from "react";
import Container from "react-bootstrap/Container";

const About = () => (
  <Container>
    <h4>Description</h4>
    <p className="px-4">
      Compute various NLP-metrics between pairs of sentences, highlight simmilar
      words and phrases and summarize long texts. Results can be saved and
      exported as LaTeX and CSV.
    </p>
    <hr />
    <h4>Sourcecode</h4>
    <a
      className="px-4"
      href="https://git.informatik.uni-leipzig.de/ds40bamo/comparefile"
    >
      https://git.informatik.uni-leipzig.de/ds40bamo/comparefile
    </a>
    <hr />
    <h4>Used Metrics and Implementations</h4>
    <p>
      <ul>
        <li>
          BERT:{" "}
          <a href="https://github.com/Tiiiger/bert_score">Tiiiger/bert_score</a>{" "}
          (<strong>model</strong>: roberta-large-mnli)
        </li>
        <li>
          BLEU:{" "}
          <a href="https://github.com/Maluuba/nlg-eval">Maluuba/nlg-eval</a>
        </li>
        <li>
          CIDEr:{" "}
          <a href="https://github.com/Maluuba/nlg-eval">Maluuba/nlg-eval</a>
        </li>
        <li>
          METEOR:{" "}
          <a href="https://github.com/Maluuba/nlg-eval">Maluuba/nlg-eval</a>
        </li>
        <li>
          MoverScore:{" "}
          <a href="https://github.com/AIPHES/emnlp19-moverscore">
            AIPHES/emnlp19-moverscore
          </a>{" "}
          (<strong>model</strong>: distilbert-base-uncased)
        </li>
        <li>
          greedy matching:{" "}
          <a href="https://github.com/Maluuba/nlg-eval">Maluuba/nlg-eval</a> (
          <strong>model</strong>: glove.6B.300d)
        </li>
        <li>
          rouge: <a href="https://github.com/pltrdy/rouge">pltrdy/rouge</a>
        </li>
      </ul>
    </p>
    <hr />
  </Container>
);

export { About };
