import React, { useState, useEffect, useRef } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Spinner from "react-bootstrap/Spinner";
import {
  FaRegFile,
  FaUpload,
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

const UploadButton = ({ getFilesRequest, uploadFileRequest, setFiles }) => {
  const fileinputRef = useRef();

  const fileSelectOnChange = () => {
    const files = fileinputRef.current.files;
    if (files.length > 0) {
      const file = files[0];
      file.text().then(text => {
        const filename = file.name;
        const filecontent = text;
        uploadFileRequest(filename, filecontent).then(() => {
          getFilesRequest()
            .then(response => response.json())
            .then(files => {
              setFiles(files);
            });
        });
      });
    }
  };
  return (
    <>
      <input
        ref={fileinputRef}
        type="file"
        onChange={fileSelectOnChange}
        style={{ display: "none" }}
      />
      <Button variant="primary" onClick={() => fileinputRef.current.click()}>
        <FaUpload />
      </Button>
    </>
  );
};

const ChooseFile = ({
  selectRef,
  getFilesRequest,
  uploadFileRequest,
  name
}) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    getFilesRequest()
      .then(response => response.json())
      .then(files => {
        setFiles(files);
      });
  }, [getFilesRequest]);
  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text>{name}:</InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl ref={selectRef} className="custom-select" as="select">
        {files.map((filename, i) => (
          <option key={i}>{filename}</option>
        ))}
      </FormControl>
      <UploadButton
        getFilesRequest={getFilesRequest}
        uploadFileRequest={uploadFileRequest}
        setFiles={setFiles}
      />
    </InputGroup>
  );
};

const Upload = ({ className, reloadResult }) => {
  const hypfileSelectRef = useRef();
  const reffileSelectRef = useRef();

  const [fileDeleteToggle, setFileDeleteToggle] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const compute = () => {
    const hypfile = hypfileSelectRef.current.value;
    const reffile = reffileSelectRef.current.value;
    if (hypfile !== "" && reffile !== "") {
      setIsComputing(true);
      calculateRequest(hypfile, reffile)
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
