import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Accordion from "react-bootstrap/Accordion";
import Badge from "react-bootstrap/Badge";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Table from "react-bootstrap/Table";

function Saved(prop) {
  const [open, setOpen] = useState()
  const saved_calculations = [
    {
      cal_id: 1,
      name: "lul",
      tables: null
    },
    {
      cal_id: 2,
      name: "lel",
      tables: null
    }
  ];
  return (
    <Card className={prop.className ? prop.className : ""}>
      <Card.Body>
      <Button variant="info" onClick={() => setOpen(!open)}>
        saved calculations <Badge variant="light" pill>1</Badge>
      </Button>
      <Collapse in={open}>
        <Accordion className="mt-4">
          <Card>
            <Accordion.Toggle as={Button} eventKey="1">
              <Card.Header>
                name <Badge variant="primary" pill>metric</Badge>
              </Card.Header>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="1">
              <Card.Body>
                <Tabs defaultActiveKey="home">
                  <Tab eventKey="home" title="Home">
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>lul</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>lel</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Tab>
                  <Tab eventKey="comparisons" title="Comparisons">
                    <Table>
                      <thead>
                        <tr>
                          <th>hyp/ref number</th>
                          <th>hyp</th>
                          <th>ref</th>
                        </tr>
                      </thead>
                      <tbody></tbody>
                    </Table>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </Collapse>
      </Card.Body>
    </Card>
  );
}

export default Saved;
