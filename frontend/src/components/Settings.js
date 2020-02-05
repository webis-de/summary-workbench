import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import { FaCogs } from "react-icons/fa";

import { getSettingsRequest, setSettingRequest } from "../common/api";

const Settings = ({ className }) => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    getSettingsRequest()
      .then(response => response.json())
      .then(result => setSettings(result));
  }, []);

  const setSetting = metric => {
    const is_set = !settings[metric].is_set;
    setSettingRequest(metric, is_set)
      .then(response => {
        if (response.ok) {
          const newsettings = Object.assign({}, settings);
          newsettings[metric].is_set = is_set;
          setSettings(newsettings);
        } else {
          alert("error setting Settings");
        }
      })
      .catch(error => alert(error));
  };

  return (
    <Card className={className ? className : ""}>
      <Card.Header>
        <FaCogs /> Choose metrics
      </Card.Header>
      <Card.Body>
        <ButtonGroup className="d-flex flex-column flex-sm-row">
          {Object.keys(settings).map(metric => {
            const { is_set, readable } = settings[metric];
            return (
              <Button
                className="border-dark"
                key={metric}
                variant={is_set ? "primary" : "default"}
                onClick={() => setSetting(metric)}
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
};

export default Settings;
