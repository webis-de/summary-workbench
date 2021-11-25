import gh from "parse-github-url";
import React, { useContext } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { Button } from "./utils/Button";
import { CenterLoading } from "./utils/Loading";

const extractGithubUser = (url) => gh(url).repo || url;

const AboutTable = ({ section, content }) => (
  <table className="uk-table uk-table-striped">
    <thead>
      <tr>
        <th>{section}</th>
        <th>Type</th>
        <th>Code</th>
        <th>Homepage</th>
        <th>Embedding Model</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(content).map(([metric, { name, type, sourcecode, model, homepage }]) => (
        <tr key={metric}>
          <td>
            <span>{name}</span>
          </td>
          <td>
            <span>{type}</span>
          </td>
          <td>{sourcecode && <a href={sourcecode}>{extractGithubUser(sourcecode)}</a>}</td>
          <td>{homepage && <a href={homepage}>{homepage}</a>}</td>
          <td>{model}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const WaitResource = ({ loading, reloader }) => {
  if (loading) return <CenterLoading />;
  return (
    <Button className="uk-container" onClick={reloader}>
      Retry
    </Button>
  );
};

const About = () => {
  const {
    summarizers,
    loading: summarizersLoading,
    reload: summarizersReload,
  } = useContext(SummarizersContext);
  const { metrics, loading: metricsLoading, reload: metricsReload } = useContext(MetricsContext);

  return (
    <article className="uk-container">
      <div>
        <h4>Summarization</h4>
        <div className="uk-margin-left">
          {!summarizers ? (
            <WaitResource loading={summarizersLoading} reloader={summarizersReload} />
          ) : (
            <AboutTable section="Summarizer" content={summarizers} />
          )}
        </div>
      </div>
      <div>
        <h4>Evaluation</h4>
        <div className="uk-margin-left">
          {!metrics ? (
            <WaitResource loading={metricsLoading} reloader={metricsReload} />
          ) : (
            <AboutTable section="Summarizer" content={summarizers} />
          )}
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
