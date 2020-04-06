import React, { useRef, useContext } from "react";
import Card from "react-bootstrap/Card";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { FaUpload } from "react-icons/fa";

import { ResultInfo } from "./ResultInfo";
import { CalculateContext } from "../contexts/CalculateContext";
import { saveCalculationRequest } from "../common/api";

const Result = ({ className, reloadSaved }) => {
  const { calculateResult, setCalculateResult } = useContext(CalculateContext);
  const nameRef = useRef();

  const upload = () => {
    const name = nameRef.current.value;
    const scores = calculateResult.scores;
    const comparisons = calculateResult.comparisons;
    saveCalculationRequest(name, scores, comparisons)
      .then(response => {
        if (response.ok) {
          setCalculateResult(null);
          reloadSaved();
        } else {
          alert("upload error");
        }
      })
      .catch(() => alert("upload error"));
  };

  if (calculateResult !== null) {
    return (
      <Card className={className ? className : ""}>
        <Card.Header>
          <InputGroup>
            <FormControl
              ref={nameRef}
              defaultValue={calculateResult.name}
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
          <ResultInfo
            scoreInfo={calculateResult.scores}
            comparisons={calculateResult.comparisons}
          />
        </Card.Body>
      </Card>
    );
  } else {
    return null;
  }
};

export { Result };
