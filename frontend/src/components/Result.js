import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { FaUpload } from "react-icons/fa";

import CalculationInfo from "./CalculationInfo"


function Result(props) {
  const [name, setName] = useState(null);
  const [scores, setScores] = useState(null);

  const nameOnChange = e => setName(e.target.value);

  useEffect(() => {
    const method = "GET";
    fetch("http://localhost:5000/api/calculation?type=scores", { method }).then(
      response => {
        if (response.ok) {
          response.json().then(({ name, scores }) => {
            setName(name);
            setScores(scores);
          });
        }
      }
    );
  }, []);

  const uploadOnClick = () => {
    const method = "POST";
    const body = JSON.stringify({ name: name });
    const headers = { "Content-Type": "application/json" };
    fetch("http://localhost:5000/api/save", { method, body, headers });
  };

  if (name !== null && scores !== null) {
    return (
      <Card className={props.className ? props.className : ""}>
        <Card.Header>
          <InputGroup>
            <FormControl defaultValue={name} onChange={nameOnChange} />
            <InputGroup.Append>
              <Button onClick={uploadOnClick}>
                <FaUpload />
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Header>
        <Card.Body className="mx-2">
          <CalculationInfo scores={scores} />
        </Card.Body>
      </Card>
    );
  } else {
    return null
  }
}

export default Result;
