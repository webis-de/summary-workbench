import React, { useState, useEffect, useCallback } from "react";
import Card from "react-bootstrap/Card";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";

import markup from "../common/fragcolors";
import Markup from "./Markup";
import { getCompareDataRequest } from "../common/api";

function scoreInfoToArray(scoreInfo) {
  const scoreValues = Object.values(scoreInfo);
  if (scoreValues.every(v => typeof v === "number")) {
    return [Object.keys(scoreInfo), [scoreValues]];
  } else {
    const xkeys = Object.keys(scoreInfo);
    const ykeys = Object.keys(scoreInfo[xkeys[0]]);
    const head = [""].concat(xkeys);
    const body = [];
    for (const ykey of ykeys) {
      const row = [ykey];
      for (const xkey of xkeys) {
        row.push(scoreInfo[xkey][ykey]);
      }
      body.push(row);
    }
    return [head, body];
  }
}

function ScoreTable({ scoreInfo }) {
  const [head, body] = scoreInfoToArray(scoreInfo);
  return (
    <Table>
      <thead>
        <tr>
          {head.map((cell, i) => (
            <th key={i}>{typeof cell === "number" ? cell.toFixed(4) : cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((row, rownum) => (
          <tr key={rownum}>
            {row.map((cell, colnum) => (
              <td key={colnum}>
                {typeof cell === "number" ? cell.toFixed(4) : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function CompareTable(props) {
  const thead = ["number", "hypothesis", "reference"];

  return (
    <Table>
      <thead>
        <tr>
          {thead.map((cell, i) => (
            <th key={i}>{cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.compare.map(([number, hypothesis, reference]) => (
          <tr key={number}>
            <td>{number}</td>
            {markup(hypothesis, reference).map((markupedText, i) => (
              <td key={i}>
                <Markup markupedText={markupedText} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

const CalculationInfo = ({ scores, fetchUrlInfix, computeDirect }) => {
  const [compareData, setCompareData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scoreEntries = Object.entries(scores);
  const hasScores = scoreEntries.length > 0;
  const start = 0;
  const end = 100;

  const fetchCompareData = useCallback(() => {
    setIsLoading(true);
    getCompareDataRequest(fetchUrlInfix, start, end)
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            const hyps = data.hyps;
            const refs = data.refs;
            if (hyps.length !== refs.length) {
              alert("not same amount of hyps and refs");
            }
            const num_hyps_refs = hyps.length;
            let pos = start + 1;
            let comp = [];
            for (let i = 0; i < num_hyps_refs; i++) {
              comp.push([pos, hyps[i], refs[i]]);
              pos += 1;
            }
            setCompareData(comp);
          });
        } else {
          alert("server error");
        }
      })
      .finally(() => setIsLoading(false));
  }, [fetchUrlInfix]);

  useEffect(() => {
    if (!hasScores && computeDirect) {
      fetchCompareData();
    }
  }, [hasScores, computeDirect, fetchCompareData]);

  const onSelect = a => {
    if (a === "compare" && compareData === null) {
      fetchCompareData();
    }
  };

  return (
    <Tabs
      onSelect={onSelect}
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
        {isLoading ? (
          <Spinner className="mr-2" animation="border" size="sm" />
        ) : compareData !== null ? (
          <CompareTable compare={compareData} />
        ) : (
          <>{'Click "Compare" to load data'}</>
        )}
      </Tab>
    </Tabs>
  );
};

export default CalculationInfo;
