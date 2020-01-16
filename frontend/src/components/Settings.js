import React, { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Button from 'react-bootstrap/Button'


function Settings(prop) {
  const settings = [
    {
      metric: "Cider",
      is_set: false
    },
    {
      metric: "Bleu",
      is_set: true
    }
  ];
  const onClick = () => alert("Hallo");
  return (
    <Card className={prop.className ? prop.className : ""}>
      <Card.Header>Choose metrics</Card.Header>
      <Card.Body>
        <ButtonGroup className="d-flex">
          {settings.map(({ metric, is_set }) => (
            <Button
              variant={is_set ? "primary" : "default"}
              onClick={onClick}
            > {metric} </Button>
          ))}
        </ButtonGroup>
      </Card.Body>
    </Card>
  );
}

export default Settings;
