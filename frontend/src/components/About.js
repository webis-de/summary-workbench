import gh from "parse-github-url";
import React, { useContext } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { Button } from "./utils/Button";
import { CenterLoading } from "./utils/Loading";

const extractGithubUser = (url) => gh(url).repo || url;

const AboutTable = ({ content, type }) => (
  <table className="uk-table uk-table-striped">
    <thead>
      <tr>
        <th>{type}</th>
        <th>Code</th>
        <th>Embedding Model</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(content).map(([metric, { readable, homepage, sourcecode, model }]) => (
        <tr key={metric}>
          <td>
            {homepage ? (
              <a href={homepage}>{extractGithubUser(readable)}</a>
            ) : (
              <span>{readable}</span>
            )}
          </td>
          <td>
            {sourcecode ? (
              <a href={sourcecode}>{extractGithubUser(sourcecode)}</a>
            ) : (
              <span>{sourcecode}</span>
            )}
          </td>
          <td>{model}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const About = () => {
  const { summarizers, loading: summarizersLoading, reload: summarizersReload } = useContext(
    SummarizersContext
  );
  const { metrics, loading: metricsLoading, reload: metricsReload } = useContext(MetricsContext);

  return (
    <article className="uk-container">
      <div>
        <h4>Summarization</h4>
        <div className="uk-margin-left">
          <>
            {summarizersLoading ? (
              <CenterLoading />
            ) : (
              <>
                {!summarizers ? (
                  <Button className="uk-container" onClick={summarizersReload}>
                    Retry
                  </Button>
                ) : (
                  <AboutTable type="Summarizer" content={summarizers} />
                )}
              </>
            )}
          </>
        </div>
      </div>
      <div>
        <h4>Evaluation</h4>
        <div className="uk-margin-left">
          <>
            {metricsLoading ? (
              <CenterLoading />
            ) : (
              <>
                {!metrics ? (
                  <Button className="uk-container" onClick={metricsReload}>
                    Retry
                  </Button>
                ) : (
                  <AboutTable type="Metric" content={metrics} />
                )}
              </>
            )}
          </>
          <div style={{ marginTop: "1em", marginBottom: "1.5em" }} className="uk-text-meta">
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
};

export { About };
