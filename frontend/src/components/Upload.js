import React, { useState, useRef, useContext } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { FaRegFile, FaArrowAltCircleDown } from "react-icons/fa";

import { calculateRequest } from "../common/api";

import { SettingsContext } from "../contexts/SettingsContext";
import { CalculateContext } from "../contexts/CalculateContext";
import { ChooseFile } from "./Upload/ChooseFile";

import { markup } from "../common/fragcolors";
import { readFile } from "../common/readFile";

const Upload = ({ className, reloadResult }) => {
  const hypFileInputRef = useRef();
  const refFileInputRef = useRef();

  const { settings } = useContext(SettingsContext);
  const { setCalculateResult } = useContext(CalculateContext);

  const [isComputing, setIsComputing] = useState(false);

  const getChosenMetrics = () => {
    const chosenMetrics = [];
    for (const [metric, metricInfo] of Object.entries(settings)) {
      if (metricInfo.is_set) {
        chosenMetrics.push(metric);
      }
    }
    return chosenMetrics;
  };

  const getComparisons = (hypdata, refdata) => {
    const hyplines = hypdata.split("\n");
    const reflines = refdata.split("\n");
    const comparisons = hyplines.map((hypline, i) => {
      const [hyp, ref] = markup(hypline, reflines[i]);
      return [i + 1, hyp, ref];
    });
    return comparisons;
  };

  const compute = () => {
    const hypfiles = hypFileInputRef.current.files;
    const reffiles = refFileInputRef.current.files;
    if (hypfiles.length !== 0 && reffiles.length !== 0) {
      setIsComputing(true);
      const hypfile = hypfiles[0];
      const reffile = reffiles[0];

      Promise.all([
        readFile(hypfile).then((text) => text.trim()),
        readFile(reffile).then((text) => text.trim()),
      ]).then(([hypdata, refdata]) => {
        const hyplines = hypdata.split("\n");
        const reflines = refdata.split("\n");
        const name = hypfile.name + "-" + reffile.name;
        const chosenMetrics = getChosenMetrics();

        if (hyplines.length === reflines.length) {
          if (chosenMetrics.length > 0) {
            calculateRequest(chosenMetrics, hypdata, refdata)
              .then((response) => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error("response not ok");
                }
              })
              .then((scores) => {
                const comparisons = getComparisons(hypdata, refdata);
                setCalculateResult({ name, scores, comparisons });
                reloadResult();
              })
              .catch((error) => {
                if (error instanceof TypeError) {
                  alert("server not available");
                } else {
                  alert("internal server error");
                }
              })
              .finally(() => setIsComputing(false));
          } else {
            const comparisons = getComparisons(hypdata, refdata);
            setCalculateResult({ name, scores: {}, comparisons });
            reloadResult();
            setIsComputing(false);
          }
        } else {
          setIsComputing(false);
          alert("files have to have equal number of lines");
        }
      });
    } else {
      alert("choose file");
    }
  };

  return (
    <Card className={className ? className : ""}>
      <Card.Header>
        <FaRegFile /> Choose File
      </Card.Header>
      <Card.Body className="p-3">
        <Row>
          <Col className="mb-3" md={6}>
            <ChooseFile fileInputRef={hypFileInputRef} name="HypFile" />
          </Col>
          <Col className="mb-3" md={6}>
            <ChooseFile fileInputRef={refFileInputRef} name="RefFile" />
          </Col>
        </Row>
        <div className="d-flex flex-sm-row flex-column justify-content-between">
          {isComputing ? ( <Spinner className="m-2" animation="border" size="lg" />
            ) : (
          <Button
            className="mb-2 m-sm-0 d-flex justify-content-center align-items-center"
            variant="success"
            size="lg"
            onClick={compute}
          >
              <FaArrowAltCircleDown className="mr-2" />
            Compute
          </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export { Upload };
