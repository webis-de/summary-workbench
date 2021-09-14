// import gh from "parse-github-url";
import React, { useContext } from "react";
import { FaCode, FaLink } from "react-icons/fa";

import { MetricsContext } from "../contexts/MetricsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { Button } from "./utils/Button";
import { CenterLoading } from "./utils/Loading";

// const extractGithubUser = (url) => gh(url).repo || url;

const isLink = (text) => text.match(/^https?:\/\//);

const Link = ({ Icon, link, title }) => {
  if (link)
    return (
      <a className="nostyle" href={link} title={title}>
        <Icon />
      </a>
    );
  return null;
};
const withIcon = (Icon, title) => (props) => <Link Icon={Icon} title={title} {...props} />;

const SourceCode = withIcon(FaCode, "sourcecode");
const HomePage = withIcon(FaLink, "homepage");

const PluginCard = ({ plugin, inline = true }) => {
  const { name, sourcecode, homepage } = plugin;
  return (
    <div
      style={{
        border: "1px solid black",
        borderRadius: "5px",
        padding: "0",
        display: inline ? "inline-block" : "block",
      }}
    >
      <div
        className="uk-flex uk-flex-between"
        style={{
          alignItems: "center",
          borderBottom: "1px solid black",
          padding: "3px",
          paddingBottom: "0",
          backgroundColor: "#B02F2C",
          color: "white",
        }}
      >
        <div>{name}</div>
        <div
          className="margin-between-10"
          style={{ marginLeft: "30px", marginBottom: "4px", paddingRight: "4px" }}
        >
          <SourceCode link={sourcecode} />
          <HomePage link={homepage} />
        </div>
      </div>
      <div style={{ padding: "5px" }}>
        {["type", "model"]
          .filter((propKey) => plugin[propKey])
          .map((propKey) => {
            const propValue = plugin[propKey];
            return (
              <div key={propKey}>
                <span style={{ fontWeight: "bold", marginRight: "10px" }}>{propKey}:</span>
                {isLink(propValue) ? <a href={propValue}>{propKey}</a> : propValue}
              </div>
            );
          })}
      </div>
    </div>
  );
};

const AboutTable = ({ plugins }) => (
  <div className="margin-between-20 uk-flex" style={{ flexWrap: "wrap" }}>
    {Object.entries(plugins).map(([key, plugin]) => (
      <PluginCard key={key} plugin={plugin} />
    ))}
  </div>
);

const About = () => {
  const {
    summarizers,
    loading: summarizersLoading,
    reload: summarizersReload,
  } = useContext(SummarizersContext);
  const { metrics, loading: metricsLoading, reload: metricsReload } = useContext(MetricsContext);

  return (
    <article>
      <div style={{ marginBottom: "1.5em" }} className="uk-text-meta">
        Evaluate a single hypothesis against the reference or upload hypothesis and reference files.
        Results can be saved and exported as LaTeX and CSV.
      </div>
      <div>
        <h4 style={{ display: "inline-flex" }}>Sourcecode</h4>
        <a
          className="uk-margin-left"
          href="https://git.informatik.uni-leipzig.de/ds40bamo/comparefile"
        >
          https://git.informatik.uni-leipzig.de/ds40bamo/comparefile
        </a>
      </div>
      <div>
        <h4>Summarization</h4>
        <div className="uk-margin-left">
          <>
            {summarizersLoading ? (
              <CenterLoading />
            ) : (
              <>
                {!summarizers ? (
                  <Button onClick={summarizersReload}>
                    Retry
                  </Button>
                ) : (
                  <AboutTable plugins={summarizers} />
                )}
              </>
            )}
          </>
        </div>
      </div>
      <div className="uk-margin">
        <h4>Evaluation</h4>
        <div className="uk-margin-left">
          <>
            {metricsLoading ? (
              <CenterLoading />
            ) : (
              <>
                {!metrics ? (
                  <Button onClick={metricsReload}>
                    Retry
                  </Button>
                ) : (
                  <AboutTable plugins={metrics} />
                )}
              </>
            )}
          </>
        </div>
      </div>
    </article>
  );
};

export { About, PluginCard };
