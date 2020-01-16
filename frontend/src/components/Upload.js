import React from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormLabel from "react-bootstrap/FormLabel";
import FormControl from "react-bootstrap/FormControl";
import { FaUpload, FaTrash } from "react-icons/fa";

function UploadField() {
  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text>Upload</InputGroup.Text>
      </InputGroup.Prepend>
      <div className="custom-file">
        <FormControl type="file" className="custom-file-input" />
        <FormLabel className="custom-file-label">Choose file</FormLabel>
      </div>
    </InputGroup>
  );
}

// <div class="fileUpload btn btn-primary glyphicon glyphicon-upload">

function Upload(prop) {
  return (
    <Card className={prop.className ? prop.className : ""}>
      <Card.Header> Choose File </Card.Header>
      <Card.Body className="p-3">
        <Row className="mb-3">
          <Col>
            <InputGroup>
              <FormControl as="select">
                <option>lul</option>
              </FormControl>
              <Button variant="primary">
                <FaUpload />
              </Button>
            </InputGroup>
          </Col>
          <Col>
            <InputGroup>
              <FormControl as="select">
                <option>lul</option>
              </FormControl>
              <Button variant="primary">
                <FaUpload />
              </Button>
            </InputGroup>
          </Col>
        </Row>
        <div>
          <Button className="float-left" variant="success" size="lg">
            compute
          </Button>
          <Button className="float-right" variant="danger" size="lg">
            <FaTrash />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Upload;
