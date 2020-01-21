import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Accordion from "react-bootstrap/Accordion";
import Badge from "react-bootstrap/Badge";

import CalculationInfo from "./CalculationInfo";

function Saved(prop) {
  const [open, setOpen] = useState(false);
  const [calculations, setCalculations] = useState([]);
  const [availSettings, setAvailSettings] = useState([]);

  useEffect(() => {
    const method = "GET";
    fetch("http://localhost:5000/api/save", { method })
      .then(response => response.json())
      .then(data => setCalculations(data));

    fetch("http://localhost:5000/api/setting", { method })
      .then(response => response.json())
      .then(result => setAvailSettings(Object.keys(result)));
  }, []);

  return (
    <Card className={prop.className ? prop.className : ""}>
      <Card.Body>
        <Button variant="info" onClick={() => setOpen(!open)}>
          saved calculations{" "}
          <Badge variant="light" pill>
            {calculations.length}
          </Badge>
        </Button>
        <Collapse in={open}>
          <Accordion className="mt-4">
            {calculations.map(([name, scores]) => (
              <Card key={name}>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey={name}>
                    {name}
                  </Accordion.Toggle>
                  {availSettings.map(setting => 
                  <>
                  <Badge
                    className="mx-1 my-2 mb-1 float-right"
                    variant={Object.keys(scores).includes(setting) ? "primary" : "secondary"}
                    pill
                  >
                    {setting}
                  </Badge>
                  </>
                  )}
                </Card.Header>
                <Accordion.Collapse eventKey={name}>
                  <Card.Body>
                    <CalculationInfo scores={scores} />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            ))}
          </Accordion>
        </Collapse>
      </Card.Body>
    </Card>
  );
}

export default Saved;
