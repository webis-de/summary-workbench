import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Spinner from "react-bootstrap/Spinner";

import { getCompareDataRequest } from "../common/api";
import { CompareTable } from "./CompareTable";
import { ScoreTable } from "./ScoreTable";

const SavedInfo = ({ name, scores }) => {
  const [comparisons, setComparisons] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scoreEntries = Object.entries(scores);
  const hasScores = scoreEntries.length > 0;
  const start = 0;
  const end = 100;

  const fetchComparisons = () => {
    setIsLoading(true);
    getCompareDataRequest(name, start, end)
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
        {hasScores
          ? scoreEntries.map(([scoreName, scoreInfo]) => (
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
            ))
          : "no scores were computed"}
      </Tab>
      <Tab className="p-3" eventKey="compare" title="Compare">
        {isLoading ? (
          <Spinner className="mr-2" animation="border" size="sm" />
        ) : (
          comparisons !== null && <CompareTable comparisons={comparisons} />
        )}
      </Tab>
    </Tabs>
  );
};

export { SavedInfo };
