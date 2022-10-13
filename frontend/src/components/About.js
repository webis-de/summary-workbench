import React, { useContext } from "react";
import { FaCode, FaExternalLinkAlt } from "react-icons/fa";

import { MetricsContext } from "../contexts/MetricsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { Button } from "./utils/Button";
import { SpaceGap } from "./utils/Layout";
import { CenterLoading } from "./utils/Loading";
import { Table, TableWrapper, Tbody, Td, Th, Thead, Tr } from "./utils/Table";
import { HeadingBig, HeadingSemiBig } from "./utils/Text";

const sourceCodeLink = "https://github.com/webis-de/summary-workbench";

const statusToValues = (status) => {
  switch (status) {
    case "unhealthy":
      return ["bg-red-400", "text-red-600"];
    case "healthy":
      return ["bg-green-400", "text-green-600"];
    case "disabled":
      return ["bg-white", "text-gray-600"];
    default:
      throw new Error(`unknown status ${status}`);
  }
};

const Status = ({ status }) => {
  const [bgColor, fgColor] = statusToValues(status);
  return (
    <div className="flex gap-2 items-center">
      <div className={`ring-1 ring-gray-500 rounded-full ${bgColor} h-2 w-2`} />
      <span className={`${fgColor} text-xs uppercase`}>{status}</span>
    </div>
  );
};

const AboutTable = ({ section, content }) => (
  <TableWrapper>
    <Table>
      <Thead>
        <Th>Status</Th>
        <Th>{section}</Th>
        <Th>Type</Th>
        <Th center>Code</Th>
        <Th center>Homepage</Th>
        <Th>Embedding Model</Th>
      </Thead>
      <Tbody>
        {Object.entries(content).map(([key, { info }]) => {
          const {
            name,
            metadata: { sourcecode, model, homepage, type },
          } = info;
          if (!info.healthy && !info.disabled) {
            return (
              <Tr key={key}>
                <Td>
                  <Status status="unhealthy" />
                </Td>
                <Td>{name}</Td>
                <Td colSpan={100} center>
                  unhealthy
                </Td>
              </Tr>
            );
          }
          return (
            <Tr key={key} hover striped>
              <Td>
                <Status status={info.disabled ? "disabled" : "healthy"} />
              </Td>
              <Td>{name}</Td>
              <Td>{type}</Td>
              <Td>
                {sourcecode && (
                  <div className="flex justify-center">
                    <Button
                      appearance="link"
                      variant="primary"
                      rel="noreferrer"
                      target="_blank"
                      href={sourcecode}
                    >
                      <FaCode size={20} />
                    </Button>
                  </div>
                )}
              </Td>
              <Td center>
                {homepage && (
                  <div className="flex justify-center">
                    <Button
                      appearance="link"
                      variant="success"
                      rel="noreferrer"
                      target="_blank"
                      href={homepage}
                    >
                      <FaExternalLinkAlt size={16} />
                    </Button>
                  </div>
                )}
              </Td>
              <Td>{model}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  </TableWrapper>
);

const WaitResource = ({ loading, reloader }) => {
  if (loading) return <CenterLoading />;
  return (
    <div className="flex justify-center">
      <Button onClick={reloader}>Retry</Button>
    </div>
  );
};

const About = () => {
  const {
    plugins: summarizers,
    loading: summarizersLoading,
    retry: summarizersReload,
  } = useContext(SummarizersContext);
  const {
    plugins: metrics,
    loading: metricsLoading,
    retry: metricsReload,
  } = useContext(MetricsContext);

  return (
    <div className="flex flex-col gap-4">
      <SpaceGap>
        <HeadingBig>Overview</HeadingBig>
        <p>
          Summary Workbench is a web application that unifies application and evaluation of text
          summarization models. It provides two core functionalities: text summarization via
          multiple models (Summarize) and automatic evaluation of model predictions (Evaluate).
        </p>
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Summarize</HeadingSemiBig>
        <p>
          <ol className="list-decimal list-inside">
            <li>
              Summarize any web page (paste a URL), plain text, or scholarly documents (upload a
              PDF) via multiple state-of-the-art models.
            </li>
            <li>
              Scholarly documents are neatly parsed to allow for summarizing only sections of
              choice.
            </li>
            <li>
              Instantly visualize lexical overlap among the generated summaries and the source
              document. Comparison among summaries is also possible.
            </li>
          </ol>
        </p>
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Evaluate</HeadingSemiBig>
        <p>
          <ol className="list-decimal list-inside">
            <li>
              Upload all model predictions on a test set as JSONL file to evaluate using multiple
              measures.
            </li>
            <li>
              Visualize semantic and lexical overlap among summaries and source documents on demand.
            </li>
            <li>Neatly export the computed scores as CSV or LaTeX tables.</li>
            <li>Computed results are cached in local storage for future inspections.</li>
          </ol>
        </p>
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Summarization Plugin Dashboard</HeadingSemiBig>
        {!summarizers ? (
          <WaitResource loading={summarizersLoading} reloader={summarizersReload} />
        ) : (
          <AboutTable section="Summarizer" content={summarizers} />
        )}
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Evaluation Plugin Dashboard</HeadingSemiBig>
        {!metrics ? (
          <WaitResource loading={metricsLoading} reloader={metricsReload} />
        ) : (
          <AboutTable section="Metric" content={metrics} />
        )}
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Code</HeadingSemiBig>
        <Button appearance="link" href={sourceCodeLink} target="_blank">
          {sourceCodeLink}
        </Button>
      </SpaceGap>
    </div>
  );
};

export { About };
