import React, { useState, useRef, useContext } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import {
  FaRegFile,
  FaTrash,
  FaArrowAltCircleDown
} from "react-icons/fa";

import {
  deleteHypsRequest,
  deleteRefsRequest,
  calculateRequest,
  getHypFilesRequest,
  getRefFilesRequest,
  uploadHypFileRequest,
  uploadRefFileRequest
} from "../common/api";

import { SettingsContext } from "../contexts/SettingsContext";
import { ChooseFile } from "./Upload/ChooseFile";


const Upload = ({ className, reloadResult }) => {
  const hypfileSelectRef = useRef();
  const reffileSelectRef = useRef();

  const { settings } = useContext(SettingsContext);
  const [fileDeleteToggle, setFileDeleteToggle] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const compute = () => {
    const hypfile = hypfileSelectRef.current.value;
    const reffile = reffileSelectRef.current.value;
    if (hypfile !== "" && reffile !== "") {
      setIsComputing(true);
      const chosenMetrics = [];
      for (const [metric, metricInfo] of Object.entries(settings)) {
        if (metricInfo.is_set) {
          chosenMetrics.push(metric);
        }
      }
      calculateRequest(chosenMetrics, hypfile, reffile)
        .then(response => {
          if (response.ok) {
            reloadResult();
          } else {
            alert("error calculation Request");
          }
        })
        .finally(() => setIsComputing(false));
    } else {
      alert("choose file");
    }
  };

  const deleteFiles = () => {
    setIsDeleting(true);
    const hypDelRequest = deleteHypsRequest();
    const refDelRequest = deleteRefsRequest();
    hypDelRequest
      .then(hypDelResponse => {
        refDelRequest.then(refDelResponse => {
          if (!hypDelResponse.ok || !refDelResponse.ok) {
            alert("delete error");
          }
          setFileDeleteToggle(!fileDeleteToggle);
        });
      })
      .finally(() => setIsDeleting(false));
  };

  return (
    <Card className={className ? className : ""}>
      <Card.Header>
        <FaRegFile /> Choose File
      </Card.Header>
      <Card.Body className="p-3">
        <Row key={fileDeleteToggle}>
          <Col className="mb-3" md={6}>
            <ChooseFile
              selectRef={hypfileSelectRef}
              getFilesRequest={getHypFilesRequest}
              uploadFileRequest={uploadHypFileRequest}
              name="HypFile"
            />
          </Col>
          <Col className="mb-3" lg={6}>
            <ChooseFile
              selectRef={reffileSelectRef}
              getFilesRequest={getRefFilesRequest}
              uploadFileRequest={uploadRefFileRequest}
              name="RefFile"
            />
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
          <Button
            className="mb-2 m-sm-0 d-flex justify-content-center align-items-center"
            variant="danger"
            size="lg"
            onClick={deleteFiles}
          >
            {isDeleting ? (
              <Spinner className="mr-2" animation="border" size="sm" />
            ) : (
              <FaTrash className="mr-2" />
            )}{" "}
            Delete Files
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Upload;
