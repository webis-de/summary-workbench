import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { FaUpload, FaTrash } from "react-icons/fa";

class ChooseFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }
  onClick = () => {
    const fileinput = this.refs.fileinput;
    fileinput.click();
  };
  onChange = () => {
    const files = this.refs.fileinput.files;
    if (files.length > 0) {
      const file = files[0]
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
            .then(files => this.setState({ files }));
      })});
    }
  };
  componentDidMount() {
    const method = "GET";
    fetch("http://localhost:5000/api/" + this.props.endpoint, { method })
      .then(response => response.json())
      .then(files => this.setState({ files }));
  }
  render() {
    return (
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>{this.props.name}:</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl className="custom-select" as="select">
          <option value="" selected disabled hidden>
            Choose {this.props.name}
          </option>
          {this.state.files.map(filename => (
            <option>{filename}</option>
          ))}
        </FormControl>
        <input
          ref="fileinput"
          type="file"
          onChange={this.onChange}
          style={{ display: "none" }}
        />
        <Button variant="primary" onClick={this.onClick}>
          <FaUpload />
        </Button>
      </InputGroup>
    );
  }
}

function Upload(props) {
  return (
    <Card className={props.className ? props.className : ""}>
      <Card.Header> Choose File </Card.Header>
      <Card.Body className="p-3">
        <Row className="mb-3">
          <Col>
            <ChooseFile endpoint="hyp" name="HypFile" />
          </Col>
          <Col>
            <ChooseFile endpoint="ref" name="RefFile" />
          </Col>
        </Row>
        <div>
          <Button className="float-left" variant="success" size="lg" onClick={props.computeOnClick}>
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
