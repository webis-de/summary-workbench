import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Table from "react-bootstrap/Table";
import { FaUpload } from "react-icons/fa";

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

function Result(props) {
  const [name, setName] = useState(false);
  const [scores, setScores] = useState(false);
  useEffect(async () => {
    const response = await fetch(
      "http://localhost:5000/api/calculation?type=scores",
      { method: "GET" }
    );
    if (response.ok) {
      const { name, scores } = await response.json();
      setName(name);
      setScores(scores);
    }
  }, []);

  if (name && scores) {
    const scoreEntries = Object.entries(scores);
    console.log(scoreEntries.length);
    return (
      <Card className={props.className ? props.className : ""}>
        <Card.Header>
          <InputGroup>
            <FormControl defaultValue="lul" />
            <InputGroup.Append>
              <Button>
                <FaUpload />
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Header>
        <Card.Body className="mx-2">
          <Tabs
            className="tab-content mb-2"
            defaultActiveKey={scoreEntries.length > 0 ? scoreEntries[0][0] : ""}
          >
            {scoreEntries.map(([scoreName, scoreInfo]) => (
              <Tab className="p-3" eventKey={scoreName} title={scoreName}>
                {typeof scoreInfo === "number" ? (
                  scoreInfo
                ) : (
                  <ScoreTable scoreInfo={scoreInfo} />
                )}
              </Tab>
            ))}
          </Tabs>
        </Card.Body>
      </Card>
    );
  } else {
    return (
      <>
        <Card className={props.className ? props.className : ""}>
          <Card.Header>no calculation yet</Card.Header>
        </Card>
      </>
    );
  }
}

export default Result;
