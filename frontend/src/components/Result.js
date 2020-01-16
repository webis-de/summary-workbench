import React from "react";
import Card from "react-bootstrap/Card";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Table from "react-bootstrap/Table";
import { FaUpload } from "react-icons/fa";

function Result(prop) {
  return (
    <Card className={prop.className ? prop.className : ""}>
      <Card.Header>
        <InputGroup>
          <FormControl defaultValue="lul" />
          <InputGroup.Append>
            <Button>
              <FaUpload />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Card.Header>
      <Card.Body className="mx-2">
        <Tabs defaultActiveKey="home">
          <Tab eventKey="home" title="Home">
            <Table>
              <thead>
                <tr>
                  <th>1</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2</td>
                </tr>
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="nothome" title="NotHome">
            <Table>
              <thead>
                <tr>
                  <th>1</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2</td>
                </tr>
              </tbody>
            </Table>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
}

export default Result;
