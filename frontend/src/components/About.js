import React, { useContext } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { Button } from "./utils/Button";
import { SpaceGap } from "./utils/Layout";
import { CenterLoading } from "./utils/Loading";
import { Table, TableWrapper, Tbody, Td, Th, Thead, Tr } from "./utils/Table";
import { HeadingBig, HeadingSemiBig } from "./utils/Text";

const AboutTable = ({ section, content }) => (
  <TableWrapper>
    <Table>
      <Thead>
        <Th>{section}</Th>
        <Th>Type</Th>
        <Th>Code</Th>
        <Th>Homepage</Th>
        <Th>Embedding Model</Th>
      </Thead>
      <Tbody>
        {Object.entries(content).map(([key, { info }]) => {
          const { name, type, sourcecode, model, homepage } = info;
          return (
            <Tr key={key} hover striped>
              <Td>{name}</Td>
              <Td>{type}</Td>
              <Td>
                {sourcecode && (
                  <Button appearance="link" variant="primary" href={sourcecode}>
                    Code
                  </Button>
                )}
              </Td>
              <Td>
                {homepage && (
                  <Button appearance="link" variant="success" href={homepage}>
                    Homepage
                  </Button>
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
    summarizers,
    loading: summarizersLoading,
    retry: summarizersReload,
  } = useContext(SummarizersContext);
  const { metrics, loading: metricsLoading, retry: metricsReload } = useContext(MetricsContext);

  return (
    <div className="flex flex-col gap-4">
      <SpaceGap>
        <HeadingBig>Overview</HeadingBig>
        <p>
          Summary Workbench is a web application to support research in text summarization. It
          provides three core functionalities: text summarization via multiple models (
          <strong>Summarize</strong>), automatic evaluation of model predictions (
          <strong>Evaluate</strong>), and visual comparison of the predictions against reference
          summaries (<strong>Visualize</strong>).
        </p>
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Summarize</HeadingSemiBig>
        <p>
          Users can select multiple models available in the tool as well as plugin their own models
          to summarize text. It is also possible to simply enter a URL whose contents are parsed and
          summarized. When multiple models are applied, a visual comparison of their summaries is
          also provided that indicates the amount of text copied from the source document in the
          summaries. Clicking on a summary sentence lexically aligns it to the corresponding
          document sentences.
        </p>
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Evaluate</HeadingSemiBig>
        <p>
          Select multiple evaluation metrics or add your evaluation metric as a plugin to evaluate
          model predictions against references. You can either evaluate two texts or two files (one
          text per line). You can save your evaluations as <strong>runs</strong> (in your local
          browser storage) and visually compare among the examples to inspect overlapping tokens.
          Finally, you can export the scores as Latex tables or as csv files.
        </p>
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Summarization Models</HeadingSemiBig>
        {!summarizers ? (
          <WaitResource loading={summarizersLoading} reloader={summarizersReload} />
        ) : (
          <AboutTable section="Summarizer" content={summarizers} />
        )}
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Evaluation Metrics</HeadingSemiBig>
        {!metrics ? (
          <WaitResource loading={metricsLoading} reloader={metricsReload} />
        ) : (
          <AboutTable section="Metric" content={metrics} />
        )}
      </SpaceGap>
      <SpaceGap>
        <HeadingSemiBig>Code</HeadingSemiBig>
        <Button appearance="link" href="https://git.informatik.uni-leipzig.de/ds40bamo/comparefile">
          https://git.informatik.uni-leipzig.de/ds40bamo/comparefile
        </Button>
      </SpaceGap>
    </div>
  );
};

export { About };
