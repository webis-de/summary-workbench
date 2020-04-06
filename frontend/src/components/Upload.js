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

  const getComparisons = async (hypdata, refdata) => {
    const hyplines = hypdata.split("\n");
    const reflines = refdata.split("\n");
    const comparisons = hyplines.map((hypline, i) => {
      const [hyp, ref] = markup(hypline, reflines[i]);
      return [i + 1, hyp, ref];
    });
    return comparisons;
  };

  const compute = async () => {
    const hypfiles = hypFileInputRef.current.files;
    const reffiles = refFileInputRef.current.files;
    if (hypfiles.length !== 0 && reffiles.length !== 0) {
      setIsComputing(true);
      const hypfile = hypfiles[0];
      const reffile = reffiles[0];

      const [hypdata, refdata] = await Promise.all([
        hypfile.text().then((text) => text.trim()),
        reffile.text().then((text) => text.trim()),
      ]);

      const hyplines = hypdata.split("\n");
      const reflines = refdata.split("\n");

      if (hyplines.length === reflines.length) {
        const compPromise = getComparisons(hypdata, refdata);
        const chosenMetrics = getChosenMetrics();
        let [comparisons, scores] = [null, {}];
        if (chosenMetrics.length > 0) {
          const calculatePromise = calculateRequest(
            chosenMetrics,
            hypdata,
            refdata
          ).then(async (response) => {
            if (response.ok) {
              return await response.json().then((scores) => scores);
            } else {
              alert("server error");
              return {};
            }
          });
          [comparisons, scores] = await Promise.all([
            compPromise,
            calculatePromise,
          ]);
        } else {
          comparisons = await compPromise;
        }
        const name = hypfile.name + "-" + reffile.name;
        setCalculateResult({ name, scores, comparisons });
        reloadResult();
      } else {
        alert("files have to have equal number of lines");
      }
      setIsComputing(false);
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
          <Button
            className="mb-2 m-sm-0 d-flex justify-content-center align-items-center"
            variant="success"
            size="lg"
            onClick={compute}
          >
            {isComputing ? (
              <Spinner className="mr-2" animation="border" size="sm" />
            ) : (
              <FaArrowAltCircleDown className="mr-2" />
            )}{" "}
            Compute
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export { Upload };
