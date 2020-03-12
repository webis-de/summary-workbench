import React from "react";
import Card from "react-bootstrap/Card";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

import { ScoreTable } from "./ScoreTable";
import { CompareTable } from "./CompareTable";

const ResultInfo = ({ scores, comparisons }) => {
  const scoreEntries = Object.entries(scores);
  const hasScores = scoreEntries.length > 0;

  return (
    <Tabs
      className="mb-2"
      defaultActiveKey={hasScores ? "metrics" : "compare"}
    >
      <Tab
        className="p-3"
        eventKey="metrics"
        title="Metrics"
        disabled={hasScores ? false : true}
      >
        {scoreEntries.map(([scoreName, scoreInfo]) => (
          <Card className="m-2" key={scoreName} border="dark">
            <Card.Header>{scoreName}</Card.Header>
            <Card.Body>
              {typeof scoreInfo === "number" ? (
                scoreInfo.toFixed(4)
              ) : (
                <ScoreTable scoreInfo={scoreInfo} />
              )}
            </Card.Body>
          </Card>
        ))}
      </Tab>
      <Tab className="p-3" eventKey="compare" title="Compare">
        <CompareTable comparisons={comparisons} />
      </Tab>
    </Tabs>
  );
};

export default ResultInfo;
