import React, { useState } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";

import { getCompareDataRequest } from "../common/api";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";
import { Export } from "./Export";

const SavedInfo = ({ name, scoreInfo }) => {
  const [comparisons, setComparisons] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasScores = Object.keys(scoreInfo).length > 0;

  const fetchComparisons = () => {
    setIsLoading(true);
    getCompareDataRequest(name)
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            setComparisons(data.comparisons);
          });
        } else {
          alert("server error");
        }
      })
      .finally(() => setIsLoading(false));
  };

  const tabSelect = (tabName) => {
    if (tabName === "compare" && comparisons === null) {
      fetchComparisons();
    }
  };

  return (
    <Tabs onSelect={tabSelect} className="mb-2" defaultActiveKey="metrics">
      <Tab className="p-3" eventKey="metrics" title="Metrics">
        {hasScores ? (
          <ScoreTable scoreInfo={scoreInfo} />
        ) : (
          "no scores were computed"
        )}
      </Tab>
      <Tab className="p-3" eventKey="compare" title="Compare">
        {isLoading ? (
          <Spinner className="mr-2" animation="border" size="sm" />
        ) : (
          comparisons !== null && <CompareTable comparisons={comparisons} />
        )}
      </Tab>
      {hasScores && (
        <Tab className="pt-3" eventKey="export" title="Export">
          <Export scoreInfo={scoreInfo} />
        </Tab>
      )}
    </Tabs>
  );
};

export { SavedInfo };
