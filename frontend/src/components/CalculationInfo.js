import React, {useState} from "react";
import Card from "react-bootstrap/Card";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Table from "react-bootstrap/Table";

function scoreInfoToArray(scoreInfo) {
  const xkeys = Object.keys(scoreInfo);
  const ykeys = Object.keys(scoreInfo[xkeys[0]]);
  const head = [""].concat(xkeys);
  const body = [];
  for (const i in ykeys) {
    const ykey = ykeys[i];
    const row = [ykey];
    for (const j in xkeys) {
      const xkey = xkeys[j];
      row.push(scoreInfo[xkey][ykey]);
    }
    body.push(row);
  }
  return [head, body];
}

function ScoreTable(props) {
  const [head, body] = scoreInfoToArray(props.scoreInfo);
  return (
    <Table>
      <thead>
        <tr>
          {head.map(cell => (
            <th>{cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map(row => (
          <tr>
            {row.map(cell => (
              <td>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function CalculationInfo(props) {
  const [compare, setCompare] = useState(null)
  const scoreEntries = Object.entries(props.scores);
  const hasScores = scoreEntries.length > 0;

  const onSelect = a => {
    if (a === "compare" && compare === null) {
    const method = "GET";
    fetch("http://localhost:5000/api/calculation?type=hyps_refs&start=0&end=10", { method }).then(
      response => {
        if (response.ok) {
          response.json().then(({ hyps, refs}) => {
            alert(hyps)
          });
        } else {
          alert("server error")
        }
      }
    );
    }
  }

  return (
    <Tabs onSelect={onSelect} className="mb-2" defaultActiveKey={hasScores ? "metrics" : "compare"}>
        <Tab className="p-3" eventKey="metrics" title="Metrics" disabled={hasScores ? false : true}>
          {scoreEntries.map(([scoreName, scoreInfo]) => (
            <Card className="m-2">
              <Card.Header bg="info">{scoreName}</Card.Header>
              <Card.Body>
                {typeof scoreInfo === "number" ? (
                  scoreInfo
                ) : (
                  <ScoreTable scoreInfo={scoreInfo} />
                )}
              </Card.Body>
            </Card>
          ))}
        </Tab>
      <Tab className="p-3" eventKey="compare" title="Compare" >
        {compare}
      </Tab>
    </Tabs>
  );
}

export default CalculationInfo;
