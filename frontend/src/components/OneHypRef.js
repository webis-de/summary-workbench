import React, { useContext, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { FaKeyboard } from "react-icons/fa";
import { FaArrowAltCircleDown } from "react-icons/fa";

import { calculateRequest } from "../common/api";
import { markup } from "../common/fragcolors";
import { SettingsContext } from "../contexts/SettingsContext";
import { Markup } from "./Markup";
import { ScoreTable } from "./ScoreTable";

const OneHypRefResult = ({ className, scoreInfo, hypothesis, reference }) => {
  const hasScores = Object.keys(scoreInfo).length > 0;

  return (
    <div className={className}>
      <Table className="mb-3">
        <tbody>
          <tr>
            <td>
              <Markup markupedText={hypothesis} />
            </td>
            <td>
              <Markup markupedText={reference} />
            </td>
          </tr>
        </tbody>
      </Table>
      {hasScores && <ScoreTable scoreInfo={scoreInfo} />}
    </div>
  );
};

const OneHypRef = ({ className }) => {
  const hypRef = useRef();
  const refRef = useRef();
  const [calculateResult, setCalculateResult] = useState(null);
  const [isComputing, setIsComputing] = useState(false);
  const { settings } = useContext(SettingsContext);

  const getChosenMetrics = () => {
    const chosenMetrics = [];
    for (const [metric, metricInfo] of Object.entries(settings)) {
      if (metricInfo.is_set) {
        chosenMetrics.push(metric);
      }
    }
    return chosenMetrics;
  };

  const getComparison = (hypdata, refdata) => {
    const [hyp, ref] = markup(hypdata, refdata);
    return [hyp, ref];
  };

  const compute = () => {
    const hypdata = hypRef.current.value;
    const refdata = refRef.current.value;
    if (hypdata.trim() === "" || refdata.trim() === "") {
      alert("no hypothesis or reference given");
      return;
    }
    setIsComputing(true);
    calculateRequest(getChosenMetrics(settings), [hypdata], [refdata])
      .then((response) => response.json())
      .then((scores) => {
        const [hyp, ref] = getComparison(hypdata, refdata);
        setCalculateResult({ scores, hyp, ref });
      })
      .finally(() => setIsComputing(false))
      .catch((e) => alert(e));
  };

  return (
    <>
      <Card className={className ? className : ""}>
        <Card.Header>
          <FaKeyboard /> Compute one example
        </Card.Header>
        <Card.Body>
          <InputGroup className="mb-3">
            <FormControl ref={hypRef} as="textarea" rows="5" />
            <FormControl ref={refRef} as="textarea" rows="5" />
          </InputGroup>
          <div className="d-flex flex-sm-row flex-column justify-content-between">
            {isComputing ? (
              <Spinner className="m-2" animation="border" size="lg" />
            ) : (
              <Button
                className="d-flex justify-content-center align-items-center"
                variant="success"
                size="lg"
                onClick={compute}
              >
                <FaArrowAltCircleDown className="mr-2" />
                Compute
              </Button>
            )}
            <Button
              className="d-flex justify-content-center align-items-center"
              variant="primary"
              size="lg"
              onClick={() => {
                hypRef.current.value = "";
                refRef.current.value = "";
              }}
            >
              Clear
            </Button>
          </div>
          {calculateResult !== null && (
            <OneHypRefResult
              className="mt-3"
              scoreInfo={calculateResult.scores}
              hypothesis={calculateResult.hyp}
              reference={calculateResult.ref}
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export { OneHypRef };
