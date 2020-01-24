import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import {
  FaRegFile,
  FaUpload,
  FaTrash,
  FaArrowAltCircleDown
} from "react-icons/fa";

class ChooseFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }
  fileUploadOnClick = () => {
    const fileinput = this.refs.fileinput;
    fileinput.click();
  };
  fileSelectOnChange = () => {
    const files = this.refs.fileinput.files;
    if (files.length > 0) {
      const file = files[0];
      file.text().then(text => {
        const filename = file.name;
        const filecontent = text;
        const method = "POST";
        const body = JSON.stringify({ filename, filecontent });
        fetch("http://localhost:5000/api/" + this.props.endpoint, {
          method,
          body,
          headers: { "Content-Type": "application/json" }
        }).then(() => {
          const method = "GET";
          fetch("http://localhost:5000/api/" + this.props.endpoint, { method })
            .then(response => response.json())
            .then(files => {
              this.setState({ files });
              if (files.length > 0) {
                this.props.setFilename(files[0]);
              }
            });
        });
      });
    }
  };
  selectOnChange = e => {
    this.props.setFilename(e.target.value);
  };
  componentDidMount() {
    const method = "GET";
    fetch("http://localhost:5000/api/" + this.props.endpoint, { method })
      .then(response => response.json())
      .then(files => {
        this.setState({ files });
        if (files.length > 0) {
          this.props.setFilename(files[0]);
        }
      });
  }
  render() {
    return (
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>{this.props.name}:</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          className="custom-select"
          as="select"
          onChange={this.selectOnChange}
        >
          {this.state.files.map(filename => (
            <option key={filename}>{filename}</option>
          ))}
        </FormControl>
        <input
          ref="fileinput"
          type="file"
          onChange={this.fileSelectOnChange}
          style={{ display: "none" }}
        />
        <Button variant="primary" onClick={this.fileUploadOnClick}>
          <FaUpload />
        </Button>
      </InputGroup>
    );
  }
}

function Upload(props) {
  const deleteButtonOnClick = () => {
    const method = "DELETE";
    const hypDelRequest = fetch("http://localhost:5000/api/hyp", { method });
    const refDelRequest = fetch("http://localhost:5000/api/ref", { method });
    hypDelRequest.then(hypDelResponse => {
      refDelRequest.then(refDelResponse => {
        if (!hypDelResponse.ok || !refDelResponse.ok) {
          alert("delete error");
        }
        window.location.reload();
      });
    });
  };
  return (
    <Card className={props.className ? props.className : ""}>
      <Card.Header>
        {" "}
        <FaRegFile /> Choose File{" "}
      </Card.Header>
      <Card.Body className="p-3">
        <Row>
          <Col className="mb-3" md={6}>
            <ChooseFile
              endpoint="hyp"
              name="HypFile"
              setFilename={props.setHypfilename}
            />
          </Col>
          <Col className="mb-3" lg={6}>
            <ChooseFile
              endpoint="ref"
              name="RefFile"
              setFilename={props.setReffilename}
            />
          </Col>
        </Row>
        <div className="d-flex flex-sm-row flex-column justify-content-between">
          <Button
            className="mb-2 m-sm-0"
            variant="success"
            size="lg"
            onClick={props.computeOnClick}
          >
            <FaArrowAltCircleDown /> Compute
          </Button>
          <Button variant="danger" size="lg" onClick={deleteButtonOnClick}>
            <FaTrash /> Delete Files
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Upload;
