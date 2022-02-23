import React, { useContext } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { Button } from "./utils/Button";
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
        {Object.entries(content).map(([metric, { name, type, sourcecode, model, homepage }]) => (
          <Tr key={metric}>
            <Td>{name}</Td>
            <Td>{type}</Td>
            <Td>{sourcecode && <Button appearence="link" variant="primary" href={sourcecode}>Code</Button>}</Td>
            <Td>{homepage && <Button appearence="link" variant="success" href={homepage}>Homepage</Button>}</Td>
            <Td>{model}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </TableWrapper>
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
    retry: summarizersReload,
  } = useContext(SummarizersContext);
  const { metrics, loading: metricsLoading, reload: metricsReload } = useContext(MetricsContext);

  return (
    <div>
      <HeadingBig>Overview</HeadingBig>
      <p className="mt-2 mb-4">Summary Workbench is a web application to support research in text summarization. It provides three core functionalities:  text summarization via multiple models (<strong>Summarize</strong>), automatic  evaluation of model predictions (<strong>Evaluate</strong>), and visual comparison of the predictions against reference summaries (<strong>Visualize</strong>).
      </p>
      <div>
        <HeadingSemiBig>Summarize</HeadingSemiBig>
        <p className="mt-2 mb-4">
        Users can select multiple models available in the tool as well as plugin their own models to summarize text. It is also possible to simply enter a URL whose contents are parsed and summarized. When multiple models are applied, a visual comparison of their summaries is also provided that indicates the amount of text copied from the source document in the summaries. Clicking on a summary sentence lexically aligns it to the corresponding document sentences. 
        </p>
      </div>
      <div>
        <HeadingSemiBig>Evaluate</HeadingSemiBig>
        <p className="mt-2 mb-4">
        Select multiple evaluation metrics or add your evaluation metric as a plugin to evaluate model predictions against references. You can either evaluate two texts or two files (one text per line). You can save your evaluations as <strong>runs</strong> (in your local browser storage) and visually compare among the examples to inspect overlapping tokens. Finally, you can export the scores as Latex tables or as csv files. 
        </p>
      </div>
      <div>
        <HeadingSemiBig>Summarization Models</HeadingSemiBig>
        <div className="uk-margin-left">
          {!summarizers ? (
            <WaitResource loading={summarizersLoading} reloader={summarizersReload} />
          ) : (
            <AboutTable section="Summarizer" content={summarizers} />
          )}
        </div>
      </div>
      <div>
        <HeadingSemiBig>Evaluation Metrics</HeadingSemiBig>
        <div className="uk-margin-left">
          {!metrics ? (
            <WaitResource loading={metricsLoading} reloader={metricsReload} />
          ) : (
            <AboutTable section="Metric" content={metrics} />
          )}
        </div>
      </div>
      <div>
        <HeadingSemiBig>Code</HeadingSemiBig>
        <a
          className="uk-margin-left"
          href="https://git.informatik.uni-leipzig.de/ds40bamo/comparefile"
        >
          https://git.informatik.uni-leipzig.de/ds40bamo/comparefile
        </a>
      </div>
    </div>
  );
};

export { About };
