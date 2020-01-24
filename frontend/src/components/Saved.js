import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Accordion from "react-bootstrap/Accordion";
import Badge from "react-bootstrap/Badge";
import { FaTrash, FaCloud } from "react-icons/fa";

import CalculationInfo from "./CalculationInfo";

function Saved(prop) {
  const [open, setOpen] = useState(true);
  const [calculations, setCalculations] = useState([]);
  const [availSettings, setAvailSettings] = useState([]);

  useEffect(() => {
    const method = "GET";
    fetch("http://localhost:5000/api/calculations", { method })
      .then(response => response.json())
      .then(data => setCalculations(data));

    fetch("http://localhost:5000/api/setting", { method })
      .then(response => response.json())
      .then(result => setAvailSettings(Object.keys(result)));
  }, []);

  const delCalculation = name => {
    const method = "DELETE";
    fetch("http://localhost:5000/api/calculation/" + encodeURIComponent(name), {
      method
    })
      .then(response => {
        console.log(response);
        if (response.status === 404) {
          alert("Resource not found");
        }
      })
      .finally(() => window.location.reload());
  };

  if (calculations.length > 0) {
    return (
      <Card className={prop.className ? prop.className : ""}>
        <Card.Body>
          <Button variant="info" onClick={() => setOpen(!open)}>
            <FaCloud /> saved calculations{" "}
            <Badge variant="light" pill>
              {calculations.length}
            </Badge>
          </Button>
          <Collapse in={open}>
            <Accordion className="mt-4">
              {calculations.map(([name, scores]) => (
                <Card key={name}>
                  <Card.Header className="d-flex justify-content-between">
                    <div className="d-md-flex flex-grow-1 justify-content-between">
                      <Accordion.Toggle
                        as={Button}
                        variant="link"
                        eventKey={name}
                      >
                        {name}
                      </Accordion.Toggle>
                      <div>
                        {availSettings.map(setting => (
                          <Badge
                            key={setting}
                            className="mx-1 my-2 mb-1"
                            variant={
                              Object.keys(scores).includes(setting)
                                ? "primary"
                                : "secondary"
                            }
                            pill
                          >
                            {setting}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="ml-3 align-self-start"
                      variant="danger"
                      onClick={() => delCalculation(name)}
                    >
                      <FaTrash />
                    </Button>
                  </Card.Header>
                  <Accordion.Collapse eventKey={name}>
                    <Card.Body>
                      <CalculationInfo
                        scores={scores}
                        fetchUrlInfix={"calculation/" + name}
                        computeDirect={false}
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              ))}
            </Accordion>
          </Collapse>
        </Card.Body>
      </Card>
    );
  } else {
    return null;
  }
}

export default Saved;
