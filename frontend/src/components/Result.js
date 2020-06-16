import React, { useContext, useRef } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import { FaUpload } from "react-icons/fa";

import { saveCalculationRequest } from "../common/api";
import { CalculateContext } from "../contexts/CalculateContext";
import { ResultInfo } from "./ResultInfo";

const UploadButton = ({ onClick }) => (
  <Button onClick={onClick}>
    <FaUpload />
  </Button>
);

const Result = ({ className, reloadSaved }) => {
  const { calculateResult, setCalculateResult } = useContext(CalculateContext);
  const nameRef = useRef();

  const upload = () => {
    const name = nameRef.current.value;
    const scores = calculateResult.scores;
    const comparisons = calculateResult.comparisons;
    saveCalculationRequest(name, scores, comparisons)
      .then(() => {
        setCalculateResult(null);
        reloadSaved();
      })
      .catch((e) => alert(e));
  };

  if (calculateResult !== null) {
    return (
      <Card className={className}>
        <Card.Header>
          <InputGroup>
            <FormControl
              ref={nameRef}
              defaultValue={calculateResult.name}
              onKeyDown={(e) => e.keyCode === 13 && upload()}
            />
            <InputGroup.Append>
              <UploadButton onClick={upload} />
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
