import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";

function Settings(prop) {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/setting", { method: "GET" })
      .then(response => response.json())
      .then(result => setSettings(result));
  }, []);

  const onClick = metric => {
    const newsettings = Object.assign({}, settings);
    const is_set = !settings[metric].is_set;
    const method = "PATCH";
    const body = JSON.stringify({ metric, is_set });
    const headers = { "Content-Type": "application/json" };
    fetch("http://localhost:5000/api/setting", { method, body, headers })
      .then(() => {
        newsettings[metric].is_set = is_set;
        setSettings(newsettings);
      })
      .catch(error => alert(error));
  };

  return (
    <Card className={prop.className ? prop.className : ""}>
      <Card.Header>Choose metrics</Card.Header>
      <Card.Body>
        <ButtonGroup className="d-flex">
          {Object.keys(settings).map(metric => {
            const { is_set, readable } = settings[metric];
            return (
              <Button
                className="border-dark"
                key={metric}
                variant={is_set ? "primary" : "default"}
                onClick={() => onClick(metric)}
              >
                {" "}
                {readable}{" "}
              </Button>
            );
          })}
        </ButtonGroup>
      </Card.Body>
    </Card>
  );
}

export default Settings;
