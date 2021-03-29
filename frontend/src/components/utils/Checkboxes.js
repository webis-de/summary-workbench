import React from "react";

const Checkbox = ({ isSet, readable, onClick }) => (
  <label className="uk-padding-small" style={{ whiteSpace: "nowrap" }}>
    <input
      className="uk-checkbox uk-margin-small-right"
      checked={isSet}
      readOnly
      onClick={onClick}
      type="checkbox"
    />
    <span style={{ whiteSpace: "nowrap" }}>{readable}</span>
  </label>
);

const Checkboxes = ({ options, toggleOption }) => (
  <div className="uk-flex uk-flex-column">
    {options.map(([option, readable, isSet]) => (
      <Checkbox
        key={option}
        readable={readable}
        isSet={isSet}
        onClick={() => toggleOption(option)}
      />
    ))}
  </div>
);

export { Checkboxes };
