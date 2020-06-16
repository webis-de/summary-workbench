import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

const RadioButton = ({ radioKey, activeKey, readable, setActiveKey }) => {
  const isActive = radioKey === activeKey;
  return (
    <Button
      variant={isActive ? "primary" : "secondary"}
      size="lg"
      onClick={() => !isActive && setActiveKey(radioKey)}
    >
      {readable}
    </Button>
  );
};

const RadioButtons = ({ className, buttonList, onChange }) => {
  const [activeKey, setActiveKey] = useState(buttonList[0][0]);
  useEffect(() => onChange(() => activeKey), [onChange, activeKey]);
  return (
    <ButtonGroup className={className}>
      {buttonList.map(([radioKey, readable]) => (
        <RadioButton
          key={radioKey}
          activeKey={activeKey}
          radioKey={radioKey}
          readable={readable}
          setActiveKey={setActiveKey}
        />
      ))}
    </ButtonGroup>
  );
};

export { RadioButtons };
