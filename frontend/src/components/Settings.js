import React, { useContext } from "react";
import Card from "react-bootstrap/Card";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import { FaCogs } from "react-icons/fa";

import { SettingsContext } from "../contexts/SettingsContext";

const Settings = ({ className }) => {
  const {settings, toggleSetting} = useContext(SettingsContext);

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
                onClick={() => toggleSetting(metric)}
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
