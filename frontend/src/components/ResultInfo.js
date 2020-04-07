import React from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

import { ScoreTable } from "./ScoreTable";
import { CompareTable } from "./CompareTable";
import { Export } from "./Export";

const ResultInfo = ({ scoreInfo, comparisons }) => {
  const hasScores = Object.keys(scoreInfo).length > 0;

  return (
    <Tabs className="mb-2" defaultActiveKey={hasScores ? "metrics" : "compare"}>
      <Tab
        className="pt-3"
        eventKey="metrics"
        title="Metrics"
        disabled={hasScores ? false : true}
      >
        <ScoreTable scoreInfo={scoreInfo} />
      </Tab>
      <Tab className="pt-3" eventKey="compare" title="Compare">
        <CompareTable comparisons={comparisons} />
      </Tab>
      {hasScores && (
        <Tab className="pt-3" eventKey="export" title="Export">
          <Export scoreInfo={scoreInfo} />
        </Tab>
      )}
    </Tabs>
  );
};

export { ResultInfo };
