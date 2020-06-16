import React from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

const SettingButton = ({ metric, is_set, readable, onClick }) => (
  <Button
    className="border-dark"
    key={metric}
    variant={is_set ? "primary" : "default"}
    onClick={onClick}
  >
    {readable}
  </Button>
);

const SettingButtons = ({ className, settings, toggleSetting }) => (
  <ButtonGroup className={className}>
    {Object.entries(settings).map(([metric, { is_set, readable }]) => (
      <SettingButton
        key={metric}
        metric={metric}
        is_set={is_set}
        readable={readable}
        onClick={() => toggleSetting(metric)}
      />
    ))}
  </ButtonGroup>
);

export {SettingButtons}
