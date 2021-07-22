import React, { useState, useEffect } from "react";
import { Button } from "./Button";

const RadioButton = ({ radioKey, activeKey, text, setActiveKey }) => {
  const isActive = radioKey === activeKey;
  return (
    <Button
      variant={(isActive ? "primary" : "default")}
      onClick={() => !isActive && setActiveKey(radioKey)}
    >
      {text}
    </Button>
  );
};

const RadioButtons = ({ className, buttonList, onChange, defaultIndex=0 }) => {
  const [activeKey, setActiveKey] = useState(defaultIndex === null ? null : buttonList[defaultIndex][0]);
  useEffect(() => onChange(() => activeKey), [onChange, activeKey]);
  return (
    <div className={className}>
      <div className="uk-button-group">
        {buttonList.map(([radioKey, text]) => (
          <RadioButton
            key={radioKey}
            activeKey={activeKey}
            radioKey={radioKey}
            text={text}
            setActiveKey={setActiveKey}
          />
        ))}
      </div>
    </div>
  );
};

export { RadioButtons };
