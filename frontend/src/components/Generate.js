import React, { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import FormControl from "react-bootstrap/FormControl";
import Spinner from "react-bootstrap/Spinner";
import { FaArrowAltCircleDown } from "react-icons/fa";

import { generateRequest } from "../common/api";

const Generate = () => {
  const inputRef = useRef();
  const [isComputing, setIsComputing] = useState(false);
  const [generatedText, setGeneratedText] = useState(null);

  const compute = () => {
    setIsComputing(true);
    generateRequest(inputRef.current.value)
      .then((response) => response.json())
      .then(({ text }) => setGeneratedText(text))
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <Container>
      <FormControl className="mb-3" ref={inputRef} as="textarea" rows="5" />

      {isComputing ? (
        <Spinner className="m-2" animation="border" size="lg" />
      ) : (
        <div className="d-flex flex-sm-row flex-column justify-content-between">
          <Button
            className="mb-2 m-sm-0 d-flex justify-content-center align-items-center"
            variant="success"
            size="lg"
            onClick={compute}
          >
            <FaArrowAltCircleDown className="mr-2" />
            Generate
          </Button>
        </div>
      )}
      {generatedText !== null && (
        <pre className="mt-3 p-4 border">{generatedText}</pre>
      )}
    </Container>
  );
};

export { Generate };
