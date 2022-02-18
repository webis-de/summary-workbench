import React, { useContext } from "react";

import { MetricsContext } from "../contexts/MetricsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { Button } from "./utils/Button";
import { CenterLoading } from "./utils/Loading";
import { Table, TableWrapper, Tbody, Td, Th, Thead, Tr } from "./utils/Table";
import { HeadingBig } from "./utils/Text";

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
            <Td>{sourcecode && <a href={sourcecode}>{sourcecode}</a>}</Td>
            <Td>{homepage && <a href={homepage}>{homepage}</a>}</Td>
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
      <div>
        <HeadingBig>Summarization</HeadingBig>
        <div className="uk-margin-left">
          {!summarizers ? (
            <WaitResource loading={summarizersLoading} reloader={summarizersReload} />
          ) : (
            <AboutTable section="Summarizer" content={summarizers} />
          )}
        </div>
      </div>
      <div>
        <HeadingBig>Evaluation</HeadingBig>
        <div className="uk-margin-left">
          {!metrics ? (
            <WaitResource loading={metricsLoading} reloader={metricsReload} />
          ) : (
            <AboutTable section="Summarizer" content={metrics} />
          )}
        </div>
      </div>
      <div>
        <HeadingBig>Code</HeadingBig>
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
