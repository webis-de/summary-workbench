import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { FaUpload } from "react-icons/fa";

import CalculationInfo from "./CalculationInfo";

function Result(props) {
  const [name, setName] = useState(null);
  const [scores, setScores] = useState(null);

  useEffect(() => {
    const method = "GET";
    fetch("http://localhost:5000/api/lastcalculation", { method }).then(
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

  const upload = () => {
    const method = "POST";
    const body = JSON.stringify({ name: name });
    const headers = { "Content-Type": "application/json" };
    fetch("http://localhost:5000/api/calculations", { method, body, headers })
      .then(() => window.location.reload())
      .catch(() => alert("upload error"));
  };

  const onSubmit = e => {
    if (e.keyCode === 13) {
      upload();
    }
  };
  const nameOnChange = e => {
    setName(e.target.value);
  };

  const fetchUrlInfix = "lastcalculation";

  if (name !== null && scores !== null) {
    return (
      <Card className={props.className ? props.className : ""}>
        <Card.Header>
          <InputGroup>
            <FormControl
              defaultValue={name}
              onChange={nameOnChange}
              onKeyDown={onSubmit}
            />
            <InputGroup.Append>
              <Button onClick={upload}>
                <FaUpload />
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Header>
        <Card.Body className="mx-2">
          <CalculationInfo
            scores={scores}
            fetchUrlInfix={fetchUrlInfix}
            computeDirect={true}
          />
        </Card.Body>
      </Card>
    );
  } else {
    return null;
  }
}

export default Result;
