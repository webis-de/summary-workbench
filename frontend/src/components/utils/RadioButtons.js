import React, { useState, useEffect } from "react";

const RadioButton = ({ radioKey, activeKey, readable, setActiveKey }) => {
  const isActive = radioKey === activeKey;
  return (
    <button
      className={
        "uk-button uk-button-large uk-button-" +
        (isActive ? "primary" : "default")
      }
      onClick={() => !isActive && setActiveKey(radioKey)}
    >
      {readable}
    </button>
  );
};

const RadioButtons = ({ className, buttonList, onChange }) => {
  const [activeKey, setActiveKey] = useState(buttonList[0][0]);
  useEffect(() => onChange(() => activeKey), [onChange, activeKey]);
  return (
    <div className={className}>
      <div className="uk-button-group">
        {buttonList.map(([radioKey, readable]) => (
          <RadioButton
            key={radioKey}
            activeKey={activeKey}
            radioKey={radioKey}
            readable={readable}
            setActiveKey={setActiveKey}
          />
        ))}
      </div>
    </div>
  );
};

export { RadioButtons };
