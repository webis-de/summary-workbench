import React, { useContext } from "react";
import Card from "react-bootstrap/Card";
import { FaCogs } from "react-icons/fa";

import { SettingsContext } from "../contexts/SettingsContext";
import { SettingButtons } from "./utils/SettingButtons";

const Settings = ({ className }) => {
  const { settings, toggleSetting } = useContext(SettingsContext);

  return (
    <Card className={className}>
      <Card.Header>
        <FaCogs /> Choose metrics
      </Card.Header>
      <Card.Body>
        <SettingButtons
          className="d-flex flex-md-row flex-column"
          settings={settings}
          toggleSetting={toggleSetting}
        />
      </Card.Body>
    </Card>
  );
};

export { Settings };
