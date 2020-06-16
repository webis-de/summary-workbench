import React, { useContext, useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { FaRegFile } from "react-icons/fa";

import { calculateRequest } from "../common/api";
import { markup } from "../common/fragcolors";
import { readFile } from "../common/readFile";
import { CalculateContext } from "../contexts/CalculateContext";
import { SettingsContext } from "../contexts/SettingsContext";
import { ChooseFile } from "./Upload/ChooseFile";
import { ComputeButton } from "./utils/ComputeButton";

const Upload = ({ className, reloadResult }) => {
  const [hypFile, setHypFile] = useState(null);
  const [refFile, setRefFile] = useState(null);

  const { settings } = useContext(SettingsContext);
  const { setCalculateResult } = useContext(CalculateContext);

  const [isComputing, setIsComputing] = useState(false);

  const getChosenMetrics = () =>
    Object.entries(settings)
      .filter(([metric, { is_set }]) => is_set)
      .map(([metric, metricInfo]) => metric);

  const getComparisons = (hypdata, refdata) => {
    const hyplines = hypdata.split("\n");
    const reflines = refdata.split("\n");
    return hyplines.map((hypline, i) => markup(hypline, reflines[i]));
  };

  const compute = () => {
    if (hypFile !== null && refFile !== null) {
      setIsComputing(true);

      Promise.all([
        readFile(hypFile).then((text) => text.trim()),
        readFile(refFile).then((text) => text.trim()),
      ]).then(([hypdata, refdata]) => {
        const hyplines = hypdata.split("\n");
        const reflines = refdata.split("\n");
        const name = hypFile.name + "-" + refFile.name;
        const chosenMetrics = getChosenMetrics();

        if (hyplines.length === reflines.length) {
          if (chosenMetrics.length > 0) {
            calculateRequest(chosenMetrics, hyplines, reflines)
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
    <Card className={className}>
      <Card.Header>
        <FaRegFile /> Choose file
      </Card.Header>
      <Card.Body className="p-3">
        <Row>
          <Col className="mb-3" md={6}>
            <ChooseFile file={hypFile} setFile={setHypFile} name="HypFile" />
          </Col>
          <Col className="mb-3" md={6}>
            <ChooseFile file={refFile} setFile={setRefFile} name="RefFile" />
          </Col>
        </Row>
        <ComputeButton
          className="d-flex flex-sm-row flex-column justify-content-between"
          isComputing={isComputing}
          onClick={compute}
        />
      </Card.Body>
    </Card>
  );
};

export { Upload };
