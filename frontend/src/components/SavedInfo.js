import React, { useEffect, useMemo, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import { getCompareDataRequest } from "../common/api";
import { CompareTable } from "./CompareTable";
import { Export } from "./Export";
import { ScoreTable } from "./ScoreTable";
import { Loading } from "./utils/Loading";

const objectLength = (o) => Object.keys(o).length;

const Metrics = ({ hasScores, scoreInfo }) =>
  hasScores ? <ScoreTable scoreInfo={scoreInfo} /> : "no scores were computed";

const Comparisons = ({ isLoading, comparisons }) => (
  <Loading isLoading={isLoading}>
    {comparisons !== null && <CompareTable comparisons={comparisons} />}
  </Loading>
);

const SavedInfo = ({ name, scoreInfo }) => {
  const metricKey = "metrics";
  const compareKey = "compare";
  const exportKey = "export";
  const defaultActiveKey = metricKey;

  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [comparisons, setComparisons] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasScores = useMemo(() => objectLength(scoreInfo) > 0, [scoreInfo]);

  useEffect(() => {
    if (activeKey === compareKey && comparisons === null) {
      setIsLoading(true);
      getCompareDataRequest(name)
        .then(({ comparisons }) => setComparisons(comparisons))
        .finally(() => setIsLoading(false));
    }
  }, [compareKey, activeKey, name, comparisons]);

  const tabSelect = (key) => {
    setActiveKey(key);
  };
  return (
    <Tabs
      onSelect={tabSelect}
      className="mb-2"
      defaultActiveKey={defaultActiveKey}
    >
      <Tab className="p-3" eventKey={metricKey} title="Metrics">
        <Metrics hasScores={hasScores} scoreInfo={scoreInfo} />
      </Tab>
      <Tab className="p-3" eventKey={compareKey} title="Compare">
        <Comparisons isLoading={isLoading} comparisons={comparisons} />
      </Tab>
      <Tab className="pt-3" eventKey={exportKey} title="Export">
        <Export scoreInfo={scoreInfo} />
      </Tab>
    </Tabs>
  );
};

export { SavedInfo };
