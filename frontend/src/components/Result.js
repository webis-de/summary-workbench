import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { FaUpload } from "react-icons/fa";

import CalculationInfo from "./CalculationInfo";
import { getCalculationRequest, saveCalculationRequest } from "../common/api";

const Result = ({ className }) => {
  const [name, setName] = useState(null);
  const [scores, setScores] = useState(null);
  useEffect(() => {
    getCalculationRequest().then(response => {
      if (response.ok) {
        response.json().then(({ name, scores }) => {
          setName(name);
          setScores(scores);
        });
      }
    });
  }, []);

  const upload = () => {
    saveCalculationRequest(name)
      .then(() => window.location.reload())
      .catch(() => alert("upload error"));
  };

  if (name !== null && scores !== null) {
    return (
      <Card className={className ? className : ""}>
        <Card.Header>
          <InputGroup>
            <FormControl
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.keyCode === 13 && upload()}
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
            fetchUrlInfix="lastcalculation"
            computeDirect={true}
          />
        </Card.Body>
      </Card>
    );
  } else {
    return null;
  }
};

export default Result;
